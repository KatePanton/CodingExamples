USE [ProductName.Portfolios]
GO
/****** Object:  StoredProcedure [dbo].[usp_NormaliseRawImportData]    Script Date: 30/08/2022 20:23:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Kate Panton>
-- Create date: <13 April 2021>
-- Description:	<Dynamic SQL to build an Insert Select script to normalize raw import data>
-- Modifications:	<Dylan Moss, Able to UPDATE as well as INSERT>
-- Modifications:	<Dylan Moss, Updated the update process to not do inner joins based on unique paramaters>

-- EXEC usp_NormaliseRawImportData @RawFileTableName='RawFileTableName', @UserId=1, @UpdateOnlyInd = 0, @IsDebugInd=1
-- =============================================
ALTER     PROCEDURE [dbo].[usp_NormaliseRawImportData]
(
	@RawFileTableName NVARCHAR(MAX),
	@UserId INT,
	@UpdateOnlyInd BIT = 0,
	@IsDebugInd BIT = 0,
	@ContainsEncryptedFieldInd BIT = 0
)
AS
BEGIN
	DECLARE
		@DestinationTableName NVARCHAR(MAX),
		@SelectedParentEntityFieldName NVARCHAR(MAX) = '',
		@ParentEntityFieldName NVARCHAR(MAX) = '',
		@FileFieldName NVARCHAR(MAX) = '',
		@TargetFieldName NVARCHAR(MAX) = '',

		@InsertPartSQL NVARCHAR(MAX) = '',
		@InsertTargetFieldName NVARCHAR(MAX) = '',

		@SelectPartSQL NVARCHAR(MAX) = '',
		@SelectTargetFieldName NVARCHAR(MAX) = '',

		@InnerJoinPartSQL NVARCHAR(MAX) ='',
		@InnerJoin NVARCHAR(MAX) = '',
		@InnerJoinOn NVARCHAR(MAX) = '',
		@JoinerTableName NVARCHAR(MAX) = '',
		@JoinerTableVariable INT = 1,

		@UniqueJoinPartSQL NVARCHAR(MAX) = '',

		@GroupByPartSQL NVARCHAR(MAX) = '',
		@GroupByField NVARCHAR(MAX) = '',

		@TablePrimaryKey NVARCHAR(MAX) = '',
		@InsertAuditFields NVARCHAR(MAX) = '',
		@SelectAuditFields NVARCHAR(MAX) = '',
		@ExecutionStatement NVARCHAR(MAX) = ''

	-- CLEAN TEMP TABLES
	DROP TABLE IF EXISTS #Mappings
	DROP TABLE IF EXISTS #SubMappings
	DROP TABLE IF EXISTS #InnerJoinMappings

	-- CREATE #Mappings
	SELECT
		FileFieldName,
		TargetEntityName,
		TargetFieldName,
		ParentEntityName,
		ParentEntityFieldName,
		IsUniqueIdentifierInd,
		UpdateRecordInd
	INTO #Mappings
	FROM NormalizationMappings

	SET @DestinationTableName = (
		SELECT TOP 1 TargetEntityName
		FROM #Mappings
		WHERE ParentEntityName IS NULL
	  )

	-- LOOP TO BUILD UP STATEMENTS PER TABLE
	WHILE (SELECT COUNT(*) FROM #Mappings) > 0
		BEGIN

			SET @InnerJoinOn = ''

			-- CREATE #SubMappings
			DROP TABLE IF Exists #SubMappings
			SELECT *
			INTO #SubMappings
			FROM #Mappings
			WHERE ISNULL(ParentEntityFieldName, '') = @SelectedParentEntityFieldName

			-- CREATE #InnerJoinMappings
			DROP TABLE IF Exists #InnerJoinMappings
			SELECT TargetEntityName, ParentEntityFieldName, ParentEntityName
			INTO #InnerJoinMappings
			FROM #Mappings
			WHERE ParentEntityName = (SELECT TOP 1 TargetEntityName FROM #SubMappings)
			GROUP BY TargetEntityName, ParentEntityFieldName, ParentEntityName

			-- INNER JOIN SETUP
			IF (@SelectedParentEntityFieldName <> '')
				BEGIN
					SET @JoinerTableName = (
						(SELECT TOP 1 TargetEntityName FROM #SubMappings)
						+ IIF(CHARINDEX(' AS ' + (SELECT TOP 1 TargetEntityName FROM #SubMappings) + ' ON ', @InnerJoinPartSQL) > 0, TRIM(STR(@JoinerTableVariable)), '')
					)
					SET @InnerJoin = (
						(SELECT TOP 1 TargetEntityName FROM #SubMappings)
						+ ' AS '
						+ @JoinerTableName
						+ ' ON '
					)
				END

			-- ADDITIONAL INNER JOIN CONDITIONS
			WHILE (SELECT COUNT(*) FROM #InnerJoinMappings) > 0
				BEGIN
					SELECT TOP 1 @ParentEntityFieldName = ParentEntityFieldName
					FROM #InnerJoinMappings

					SELECT TOP 1 @InnerJoinOn = @InnerJoinOn + IIF(@InnerJoinOn = '', '', ' AND ') + TargetEntityName + '.' + fn.GetTablePrimaryKey(TargetEntityName) + ' = ' + ParentEntityName +'.' + ParentEntityFieldName
					FROM #InnerJoinMappings
					WHERE ParentEntityFieldName = @ParentEntityFieldName

					DELETE #InnerJoinMappings Where ParentEntityFieldName = @ParentEntityFieldName
				END

			-- UNIQUE LEFT JOIN SETUP
			IF (SELECT TOP 1 IsUniqueIdentifierInd FROM #SubMappings) = 1
			AND (@SelectedParentEntityFieldName <> '')
			AND (SELECT TOP 1 ParentEntityName FROM #SubMappings) = @DestinationTableName
			AND @UpdateOnlyInd = 0
				BEGIN
					SELECT TOP 1
						@UniqueJoinPartSQL = (
							@UniqueJoinPartSQL
							+ IIF(@UniqueJoinPartSQL = '', '', ' AND ')
							+ @DestinationTableName
							+ '.'
							+ (ParentEntityFieldName)
							+ ' = '
							+ @JoinerTableName
							+ '.'
							+ (fn.GetTablePrimaryKey(TargetEntityName))
						)
					FROM #SubMappings
				 END

			-- MAIN LOOP TO BUILD UP STATEMENTS PER ROW
			WHILE (SELECT COUNT(*) FROM #SubMappings) > 0
				BEGIN
					SELECT TOP 1 @FileFieldName = FileFieldName
								 ,@TargetFieldName = TargetFieldName
					FROM #SubMappings

					-- INSERT & SELECT & GROUP BY SETUP
					IF (SELECT TOP 1 TargetEntityName FROM #SubMappings) = @DestinationTableName
					OR (SELECT TOP 1 ParentEntityName FROM #SubMappings) = @DestinationTableName
						BEGIN
							IF @SelectedParentEntityFieldName = ''
								SELECT TOP 1
									@InsertTargetFieldName = (TargetFieldName),
									@SelectTargetFieldName = (
										IIF(@UpdateOnlyInd = 0,
											@RawFileTableName + '.' + (@FileFieldName) + ' AS ' + @TargetFieldName,
											IIF(UpdateRecordInd = 1, TargetFieldName + '=' + @RawFileTableName + '.' + (@FileFieldName),'')
										)
									), -- This is used for the update version
									@GroupByField = (
										@RawFileTableName
										+ '.'
										+ (@FileFieldName)
									)
									FROM #SubMappings
							ELSE
								SELECT TOP 1
									@InsertTargetFieldName = (ParentEntityFieldName),
									@SelectTargetFieldName = (
										IIF(@UpdateOnlyInd = 0,
											(@JoinerTableName
												+ '.'
												+ (fn.GetTablePrimaryKey(TargetEntityName))
												+ ' AS '
												+ (ParentEntityFieldName)),
											ParentEntityFieldName + '=' + TargetEntityName + '.' + ParentEntityFieldName)
									),
									@GroupByField = (
										@JoinerTableName
										+ '.'
										+ (fn.GetTablePrimaryKey(TargetEntityName))
									)
									FROM #SubMappings
						END

					-- INNER JOIN ON SETUP
					IF (@SelectedParentEntityFieldName <> '')
						BEGIN
							SELECT TOP 1
								@InnerJoinOn = (
									@InnerJoinOn
									+ IIF(@InnerJoinOn = '', '', ' AND ')
									+ @RawFileTableName
									+ '.'
									+ (FileFieldName)
									+ ' = '
									+ @JoinerTableName
									+ '.'
									+ (TargetFieldName)
								)
							FROM #SubMappings
						END

					-- UNIQUE LEFT JOIN SETUP
					IF (SELECT TOP 1 IsUniqueIdentifierInd FROM #SubMappings) = 1
					AND (@SelectedParentEntityFieldName = '')
						BEGIN
							SELECT TOP 1
								@UniqueJoinPartSQL = (
									@UniqueJoinPartSQL
									+ IIF(@UniqueJoinPartSQL = '', '', ' AND ')
									+ @DestinationTableName
									+ '.'
									+ (TargetFieldName)
									+ ' = '
									+ @RawFileTableName
									+ '.'
									+ (FileFieldName)
								)
							FROM #SubMappings
						END

					-- COMBINE NEW PARTS ONTO EXISTING PARTS
					SELECT
						@InsertPartSQL =
							IIF(CHARINDEX(' ' + @InsertTargetFieldName + ',', @InsertPartSQL) > 0,
								@InsertPartSQL,
								(@InsertPartSQL + ' ' + @InsertTargetFieldName + ', ')
							),
						@SelectPartSQL =
							IIF(@SelectTargetFieldName <> '',
								IIF(CHARINDEX(' ' + @SelectTargetFieldName + ',', @SelectPartSQL) > 0,
									@SelectPartSQL,
									(@SelectPartSQL + ' ' + @SelectTargetFieldName  + ', ')
								),
							@SelectPartSQL),
						@InnerJoinPartSQL = @InnerJoinPartSQL,
						@GroupByPartSQL =
							IIF(CHARINDEX(' ' + @GroupByField + ',', @GroupByPartSQL) > 0,
								@GroupByPartSQL,
								(@GroupByPartSQL + ' ' + @GroupByField + ', ')
							)

					-- COUNTER TO MOVE ONTO NEXT #SubMappings ROW
					DELETE #SubMappings
					WHERE FileFieldName = @FileFieldName
						AND TargetFieldName = @TargetFieldName
				END

			-- COMBINE NEW INNER JOIN ONTO EXISTING INNER JOIN
			IF LEN(@InnerJoin) > 1
				SET @InnerJoinPartSQL = (' INNER JOIN ' + @InnerJoin + @InnerJoinOn + @InnerJoinPartSQL)

			-- COUNTER TO MOVE ONTO NEXT JoinerTable VARIABLE
			SET @JoinerTableVariable = @JoinerTableVariable + 1

			-- COUNTER TO MOVE ONTO NEXT #Mappings ROW
			DELETE FROM #Mappings WHERE ISNULL(ParentEntityFieldName, '') = @SelectedParentEntityFieldName

			-- SETUP @SelectedParentEntityFieldName, 1st LOOP @SelectedParentEntityFieldName SHOULD BE NULL
			SET @SelectedParentEntityFieldName = (
				SELECT TOP 1 M1.ParentEntityFieldName
				FROM #Mappings M1
				LEFT JOIN #Mappings M2 ON M1.ParentEntityName = M2.TargetEntityName
				WHERE M2.FileFieldName IS NULL
			)

		END

	-- ADDITIONAL VARIABLE SETUP
	SET @TablePrimaryKey = (SELECT fn.GetTablePrimaryKey(@DestinationTableName))
	SET @InsertAuditFields = (' Audit_CreatedBy, Audit_CreatedOn, Audit_ModifiedBy, Audit_ModifiedOn, IsDeletedInd')
	SET @SelectAuditFields = (
		CONVERT(NVARCHAR(10), @UserId)
		+ ' AS Audit_CreatedBy, '''
		+ CONVERT(NVARCHAR(30), GETUTCDATE(), 21)
		+ ''' AS Audit_CreatedOn, '
		+ CONVERT(NVARCHAR(10),@UserId)
		+ ' AS Audit_ModifiedBy, '''
		+ CONVERT(NVARCHAR(30),GETUTCDATE(),21)
		+ ''' AS Audit_ModifiedOn, '
		+ '0 AS IsDeletedInd'
	  )

	-- VARIABLE CLEANUP
	SET @InsertPartSQL = TRIM(@InsertPartSQL + @InsertAuditFields)
	SET @SelectPartSQL = TRIM(@SelectPartSQL + IIF(@UpdateOnlyInd = 0, @SelectAuditFields, ''))
	SET @InnerJoinPartSQL = @InnerJoinPartSQL
	SET @GroupByPartSQL = SUBSTRING(@GroupByPartSQL, 1, (LEN(@GroupByPartSQL)) -1)

	-- BUILD EXECUTION STATEMENT
	SET @ExecutionStatement =
		IIF(@UpdateOnlyInd = 0,
			('INSERT INTO ' + @DestinationTableName + ' (' +  @InsertPartSQL + ')'
				+ ' SELECT ' + @SelectPartSQL
				+ ' FROM ' + @RawFileTableName
				+ ' ' + @InnerJoinPartSQL
				+ ' LEFT JOIN ' + @DestinationTableName + ' ON ' + @UniqueJoinPartSQL
				+ ' WHERE ' + @DestinationTableName + '.' + @TablePrimaryKey + ' IS NULL'
				+  IIF(@ContainsEncryptedFieldInd = 0, -- Only perform group bys on non-encrypted tables
					' GROUP BY ' + @GroupByPartSQL + '','')
			),
			('UPDATE ' + @DestinationTableName
				+ ' SET ' + SUBSTRING(@SelectPartSQL, 0, LEN(@SelectPartSQL))
				+ ' FROM ' + @RawFileTableName
				+ ' ' + @InnerJoinPartSQL
				+ ' INNER JOIN ' + @DestinationTableName + ' ON ' + @UniqueJoinPartSQL
			)
		)

	-- EXECUTE OR PRINT
	IF @IsDebugInd = 1
		BEGIN
			PRINT @ExecutionStatement
		END
	ELSE
		BEGIN
			EXEC (@ExecutionStatement)
		END
END
