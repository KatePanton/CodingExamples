namespace ProductName.Clients.Api.Controllers
{
  using System;
  using System.Threading.Tasks;
  using ProductName.Clients.Application.AffordabilityAssessment.Contracts.Commands;
  using ProductName.Clients.Application.AffordabilityAssessment.Contracts.Queries;
  using ProductName.Clients.Models.Lookups;
  using ProductName.Clients.Models.SharedModels;
  using MediatR;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  /// <summary>
  /// Controller to provide all Affordability Assessment related endpoints
  /// </summary>
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class AffordabilityAssessmentController : Controller
  {
    private readonly IMediator mediator;

    /// <summary>
    /// Initializes a new instance of the <see cref="AffordabilityAssessmentController"/> class
    /// </summary>
    /// <param name="mediator">The Mediator to send requests to</param>
    public AffordabilityAssessmentController(IMediator mediator)
    {
      this.mediator = mediator;
    }

    /// <summary>
    /// Create an Affordability Assessment.
    /// </summary>
    /// <param name="command">Command</param>
    /// <returns> Submit client result </returns>
    [HttpPost("createAffordabilityAssessment")]
    public async Task<IActionResult> CreateAffordabilityAssessment(CreateAffordabilityAssessmentCommand command)
    {
      var result = await this.mediator.Send(command).ConfigureAwait(false);

      if (result.Success)
      {
        return this.Ok(result);
      }

      return this.BadRequest(result);
    }

    /// <summary>
    /// Create Credit Report.
    /// </summary>
    /// <param name="command">Command</param>
    /// <returns> Submit client result </returns>
    [HttpPost("createCreditReport")]
    public async Task<IActionResult> CreateCreditReport(CreateCreditReportCommand command)
    {
      var result = await this.mediator.Send(command).ConfigureAwait(false);

      if (result.Success)
      {
        return this.Ok(result);
      }

      return this.BadRequest(result);
    }

    /// <summary>
    /// Get Credit Report By Source Loan Application Id.
    /// </summary>
    /// <param name="sourceLoanApplicationId">The Source Loan Application Id.</param>
    /// <returns> The <see cref="CreditReportLookup"/> result.</returns>
    [HttpGet("getCreditReportBySourceLoanApplicationId/{sourceLoanApplicationId}")]
    public async Task<ActionResult<CreditReportLookup>> GetCreditReportBySourceLoanApplicationId(int sourceLoanApplicationId)
    {
      var result = await this.mediator.Send(new GetCreditReportLookupBySourceLoanApplicationIdQuery { SourceLoanApplicationId = sourceLoanApplicationId, }).ConfigureAwait(false);

      if (result != null)
      {
        return this.Ok(result);
      }

      return this.NoContent();
    }

    /// <summary>
    /// Get the latest affordability assessment data by a client Id.
    /// </summary>
    /// <param name="clientId">The client Id</param>
    /// <returns>An affordability assessment data object.</returns>
    [HttpGet("getAffordabilityAssessmentData")]
    public async Task<ActionResult<AffordabilityAssessmentData>> GetAffordabilityAssessmentData([FromQuery] Guid clientId)
    {
      var query = new GetAffordabilityAssessmentDataQuery { ClientId = clientId };
      var result = await this.mediator.Send(query).ConfigureAwait(false);

      if (result != null)
      {
        return this.Ok(result);
      }

      return this.NotFound();
    }

    /// <summary>
    /// Get the latest affordability assessment summary lookup by a client Id.
    /// </summary>
    /// <param name="clientId">The client Id</param>
    /// <returns>An affordability assessment summary lookup object.</returns>
    [HttpGet("GetAffordabilityAssessmentSummaryLookup")]
    public async Task<ActionResult<AffordabilityAssessmentData>> GetAffordabilityAssessmentSummaryLookup([FromQuery] Guid clientId)
    {
      var query = new GetAffordabilityAssessmentSummaryLookupQuery { ClientId = clientId };
      var result = await this.mediator.Send(query).ConfigureAwait(false);

      if (result != null)
      {
        return this.Ok(result);
      }

      return this.NotFound();
    }

    /// <summary>
    /// Get the latest affordability assessment data by a source loan application Id.
    /// </summary>
    /// <param name="sourceLoanApplicationId">The source loan application Id</param>
    /// <returns>a list of Affordability Assessment Amount Lookups.</returns>
    [HttpGet("getAffordabilityAssessmentByApplicationId")]
    public async Task<ActionResult<AffordabilityAssessmentAmountLookup>> GetAffordabilityAssessmentByApplicationId([FromQuery] int sourceLoanApplicationId)
    {
      var query = new GetAffordabilityAssessmentByApplicationIdQuery { SourceLoanApplicationId = sourceLoanApplicationId };
      var result = await this.mediator.Send(query).ConfigureAwait(false);

      if (result != null)
      {
        return this.Ok(result);
      }
      else
      {
        var affordabilityAssessmentAmountLookup = new AffordabilityAssessmentAmountLookup();
        return this.Accepted(affordabilityAssessmentAmountLookup);
      }
    }
  }
}