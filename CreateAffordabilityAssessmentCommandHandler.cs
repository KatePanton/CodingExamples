namespace ProductName.Clients.Application.AffordabilityAssessment.Handlers.CommandHandlers
{
  using System;
  using System.Collections.Generic;
  using System.Threading;
  using System.Threading.Tasks;
  using ProductName.Clients.Application.AffordabilityAssessment.Contracts.Commands;
  using ProductName.Clients.Application.Infrastructure;
  using ProductName.Clients.Models;
  using ProductName.Clients.Models.AffordabilityAssessments;
  using ProductName.Clients.Repositories.AffordabilityAssessment;
  using ProductName.Platform.Models.AffordabilityAssessments;
  using ProductName.Platform.Models.Lookups;
  using MediatR;

  /// <summary>
  /// Command handler to create a Affordability Assessment.
  /// </summary>
  public class CreateAffordabilityAssessmentCommandHandler : IRequestHandler<CreateAffordabilityAssessmentCommand, CommandResult>
  {
    private readonly IAffordabilityAssessmentRepository affordabilityAssessmentRepository;
    private AffordabilityAssessment affordabilityAssessment;

    /// <summary>
    /// Initializes a new instance of the <see cref="CreateAffordabilityAssessmentCommandHandler"/> class.
    /// </summary>
    /// <param name="affordabilityAssessmentRepository">The Affordability Assessment repository.</param>
    public CreateAffordabilityAssessmentCommandHandler(
      IAffordabilityAssessmentRepository affordabilityAssessmentRepository)
    {
      this.affordabilityAssessmentRepository = affordabilityAssessmentRepository;
    }

    /// <inheritdoc/>
    public async Task<CommandResult> Handle(CreateAffordabilityAssessmentCommand request, CancellationToken cancellationToken)
    {
      try
      {
        this.affordabilityAssessment = new AffordabilityAssessment();

        var entity = request.AffordabilityAssessments;

        this.SplitAffordabilityAssessmentArray(request.AffordabilityAssessments);

        this.affordabilityAssessment.SourceLoanApplicationId = request.SourceLoanApplicationId;

        var validateAffordabilityAssessment = this.affordabilityAssessment.ValidationCheck();

        if (!validateAffordabilityAssessment.Success)
        {
          return new CommandResult(false, validateAffordabilityAssessment.ValidationErrors.ToString());
        }

        await this.affordabilityAssessmentRepository.AddAndSave(this.affordabilityAssessment).ConfigureAwait(false);
        return new CommandResult(true);
      }
      catch (Exception ex)
      {
        return new CommandResult(false, ex.Message, null);
      }
    }

    private void SplitAffordabilityAssessmentArray(List<AffordabilityAssessmentLookup> affordabilityAssessmentList)
    {
      try
      {
        foreach (AffordabilityAssessmentLookup assessment in affordabilityAssessmentList)
        {
          foreach (AffordabilityAssessmentElementLookup element in assessment.AffordabilityAssessmentElements)
          {
            foreach (AffordabilityAssessmentGroupingLookup grouping in element.AffordabilityAssessmentGroupings)
            {
              foreach (AffordabilityAssessmentItemLookup item in grouping.AffordabilityAssessmentItems)
              {
                this.MapAffordabilityAssessmentItemSummary(item);
              }

              this.MapAffordabilityAssessmentGroupingSummary(grouping);
            }

            this.MapAffordabilityAssessmentElementSummary(element);
          }

          this.MapAffordabilityAssessment(assessment);
        }
      }
      catch (Exception ex)
      {
        var commandResult = new CommandResult(false, ex.Message, null);
      }
    }

    private void MapAffordabilityAssessment(AffordabilityAssessmentLookup assessment)
    {
      this.affordabilityAssessment.ClientId = assessment.ClientId;
      this.affordabilityAssessment.TotalAmount = assessment.AffordabilityAssessmentTotalAmount;
      this.affordabilityAssessment.Note = assessment.Note;
    }

    private void MapAffordabilityAssessmentElementSummary(AffordabilityAssessmentElementLookup element)
    {
      var elementSummary = new AffordabilityAssessmentElementSummary();
      elementSummary.SourceAffordabilityAssessmentElementId = element.AffordabilityAssessmentElementId;
      elementSummary.ElementSummary = element.ElementTotalName;
      elementSummary.ElementCode = element.ElementCode;
      elementSummary.ElementAmount = element.ElementTotalAmount;

      this.affordabilityAssessment.AffordabilityAssessmentElementSummaries.Add(elementSummary);
    }

    private void MapAffordabilityAssessmentGroupingSummary(AffordabilityAssessmentGroupingLookup grouping)
    {
      var groupingSummary = new AffordabilityAssessmentGroupingSummary();
      groupingSummary.SourceAffordabilityAssessmentGroupingId = grouping.AffordabilityAssessmentGroupingId;
      groupingSummary.GroupingSummary = grouping.GroupingTotalName;
      groupingSummary.GroupingCode = grouping.GroupingCode;
      groupingSummary.GroupingAmount = grouping.GroupingTotalAmount;

      this.affordabilityAssessment.AffordabilityAssessmentGroupingSummaries.Add(groupingSummary);
    }

    private void MapAffordabilityAssessmentItemSummary(AffordabilityAssessmentItemLookup item)
    {
      var itemSummary = new AffordabilityAssessmentItemSummary();
      itemSummary.SourceAffordabilityAssessmentItemId = item.AffordabilityAssessmentItemId;
      itemSummary.ItemSummary = item.ItemLabel;
      itemSummary.ItemAmount = item.ItemAmount;

      this.affordabilityAssessment.AffordabilityAssessmentItemSummaries.Add(itemSummary);
    }
  }
}
