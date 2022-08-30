namespace ProductName.Clients.Repositories.AffordabilityAssessment
{
  using System;
  using System.Linq;
  using System.Threading.Tasks;
  using ProductName.Clients.Constants.Enums;
  using ProductName.Clients.Models;
  using ProductName.Clients.Models.AffordabilityAssessments;
  using ProductName.Clients.Models.Lookups;
  using ProductName.Clients.Models.SharedModels;
  using ProductName.Platform.Models.Lookups;
  using Microsoft.EntityFrameworkCore;
  using Neo.Extensions;
  using Neo.Model.Services;

  /// <summary>
  /// Affordability Assessment Repository
  /// </summary>
  public class AffordabilityAssessmentRepository : UpdateableModelService<AffordabilityAssessment, ClientsDbContext, int>, IAffordabilityAssessmentRepository
  {
    /// <summary>
    /// Initializes a new instance of the <see cref="AffordabilityAssessmentRepository"/> class.
    /// </summary>
    /// <param name="dbContext">DB context</param>
    public AffordabilityAssessmentRepository(ClientsDbContext dbContext)
      : base(dbContext)
    {
    }

    /// <inheritdoc/>
    public async Task AddAndSave(AffordabilityAssessment entity)
    {
      this.AddEntity(entity);
      await this.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task UpdateAndSave(AffordabilityAssessment entity)
    {
      this.Context.AffordabilityAssessments.Update(entity);
      await this.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task AddAndSave(CreditReport entity)
    {
      await this.Context.CreditReports.AddAsync(entity).ConfigureAwait(false);
      await this.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task UpdateAndSave(CreditReport entity)
    {
      this.Context.CreditReports.Update(entity);
      await this.SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc/>
    public async Task<AffordabilityAssessmentData> GetAffordabilityAssessmentData(Guid clientId)
    {
      var affordabilityAssessmentData = await this.Entities
        .Where(x => x.ClientId == clientId)
        .OrderByDescending(x => x.Audit.CreatedOn)
        .Select(x => new AffordabilityAssessmentData
        {
          NetTotal = x.TotalAmount,
          TotalBureauAndInsuranceExpenses = x.Client.CreditReport.TotalBureauDebtInsuranceInstalments,
          GroupSummaries = x.AffordabilityAssessmentGroupingSummaries.Select(g => new AffordabilityAssessmentSummaryData
          {
            SummaryCode = g.GroupingCode,
            Value = g.GroupingAmount,
          }).ToList(),
          ElementSummaries = x.AffordabilityAssessmentElementSummaries.Select(g => new AffordabilityAssessmentSummaryData
          {
            SummaryCode = g.ElementCode,
            Value = g.ElementAmount,
          }).ToList(),
        }).FirstOrDefaultAsync().ConfigureAwait(false);

      return affordabilityAssessmentData;
    }

    /// <inheritdoc/>
    public async Task<AffordabilityAssessmentSummaryLookup> GetAffordabilityAssessmentSummaryLookupByClientId(Guid clientId)
    {
      var affordabilityAssessmentData = await this.Entities
        .Where(x => x.ClientId == clientId)
        .OrderByDescending(x => x.Audit.CreatedOn)
        .Select(x => new AffordabilityAssessmentSummaryLookup
        {
          DisposableIncome = x.TotalAmount,
          TotalBureauDebtInsuranceInstalments = x.Client.CreditReport.TotalBureauDebtInsuranceInstalments,
          CreditScore = x.Client.CreditReport.BureauCreditScore,
          TotalIncome = x.AffordabilityAssessmentGroupingSummaries.Where(c => c.GroupingCode == AffordabilityAssessmentGroupingSummaryEnum.TotalIncome.Description()).Select(c => c.GroupingAmount).FirstOrDefault(),
          TotalExpenses = x.AffordabilityAssessmentElementSummaries.Where(c => c.ElementCode == AffordabilityAssessmentElementEnum.TotalGrossExpenses.Description()).Select(c => c.ElementAmount).FirstOrDefault(),
        }).FirstOrDefaultAsync().ConfigureAwait(false);

      return affordabilityAssessmentData;
    }

    /// <inheritdoc/>
    public async Task<CreditReport> GetCreditReportByClientId(Guid clientId)
    {
      var creditReport = await this.Context.CreditReports
        .Where(x => x.ClientId == clientId)
        .FirstOrDefaultAsync().ConfigureAwait(false);

      return creditReport;
    }

    /// <inheritdoc/>
    public async Task<CreditReportLookup> GetCreditReportLookupBySourceLoanApplicationId(int sourceLoanApplicationId)
    {
      var creditReportLookup = await this.Context.CreditReports
        .Select(x => new CreditReportLookup
        {
          CreditReportId = x.CreditReportId,
          SourceLoanApplicationId = x.LatestSourceLoanApplicationId,
          ClientId = x.ClientId,
          BureauCreditScore = x.BureauCreditScore,
          TotalBureauDebtAndInsuranceInstalments = x.TotalBureauDebtInsuranceInstalments,
          TotalBureauInstalments = x.TotalBureauInstalments,
          TotalOtherInstalments = x.TotalOtherInstalments,
        }).FirstOrDefaultAsync(x => x.SourceLoanApplicationId == sourceLoanApplicationId).ConfigureAwait(false);

      return creditReportLookup;
    }

    /// <inheritdoc/>
    public async Task<AffordabilityAssessmentAmountLookup> GetAffordabilityAssessmentByApplicationId(int sourceLoanApplicationId)
    {
      var affordabilityAssessmentAmountLookup = await this.Entities
             .Where(x => x.SourceLoanApplicationId == sourceLoanApplicationId)
             .OrderByDescending(x => x.Audit.CreatedOn)
             .Select(x => new AffordabilityAssessmentAmountLookup
             {
               AffordabilityAssessmentId = x.AffordabilityAssessmentId,
               ClientId = x.ClientId,
               Note = x.Note,
               AffordabilityAssessmentItems = x.AffordabilityAssessmentItemSummaries
                .Select(i => new AffordabilityAssessmentItemAmountLookup
                {
                  SourceAffordabilityAssessmentItemId = i.SourceAffordabilityAssessmentItemId,
                  ItemAmount = i.ItemAmount,
                }).ToList(),
             }).FirstOrDefaultAsync().ConfigureAwait(false);

      return affordabilityAssessmentAmountLookup;
    }
  }
}
