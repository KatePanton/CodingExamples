import { List, NeoModel, NotifyUtils } from '@singularsystems/neo-core';
import { Views } from '@singularsystems/neo-react';
import { AppService, Types } from '../../../../../App/Services/AppService';
import { Clients, Platform } from '../../../../../App';
import { TextConstants } from '../../../../../Common/TextConstants';
import { NotificationDuration } from '../../../../../App/Models/Enums/NotificationDuration';

@NeoModel
export default class SelectAffordabilityAssessmentComponentVM extends Views.ViewModelBase {

    public affordabilityAssessmentList = new List(Platform.AffordabilityAssessmentLookup);
    public affordabilityAssessmentAmountLookup = new Clients.AffordabilityAssessmentAmountLookup();
    public createAffordabilityAssessmentCommand = new Clients.CreateAffordabilityAssessmentCommand();
    public getAffordabilityAssessmentLookupListQuery = new Platform.GetAffordabilityAssessmentLookupListQuery();
    public isAffordabilityAssessmentSubmittedInd = false;
    public clientId: string = "";
    public loanApplicationId = 0;

    constructor(
        taskRunner = AppService.get(Types.Neo.TaskRunner),
        private platformAffordabilityAssessmentsApiClient = AppService.get(Platform.PlatformTypes.ApiClients.AffordabilityAssessmentsApiClient),
        private clientAffordabilityAssessmentsApiClient = AppService.get(Clients.ClientsTypes.ApiClients.AffordabilityAssessmentsApiClient)
    ) {
        super(taskRunner);
    }

    public async load(loanApplicationId: number, clientId: string) {
        this.clientId = clientId;
        this.loanApplicationId = loanApplicationId;

        const getAffordabilityAssessmentListResponse = await this.platformAffordabilityAssessmentsApiClient.getAffordabilityAssessmentList(this.getAffordabilityAssessmentLookupListQuery!.toJSObject());
        if (getAffordabilityAssessmentListResponse.status === 200) {
            this.affordabilityAssessmentList.set(getAffordabilityAssessmentListResponse.data);
            await this.loadExistingAffordabilityAssessment(loanApplicationId);
        }
    }

    private async loadExistingAffordabilityAssessment(loanApplicationId: number) {
        const getAffordabilityAssessmentByIdResponse = await this.clientAffordabilityAssessmentsApiClient.getAffordabilityAssessmentByApplicationId(loanApplicationId);
        if (getAffordabilityAssessmentByIdResponse.status === 200) {
            this.affordabilityAssessmentAmountLookup.set(getAffordabilityAssessmentByIdResponse.data);
            this.mapExistingAffordabilityAssessment();
        }
    }

    private mapExistingAffordabilityAssessment() {
        this.affordabilityAssessmentList.forEach(assessment => {
            assessment.affordabilityAssessmentElements.forEach(element => {
                element.affordabilityAssessmentGroupings.forEach(group => {
                    group.affordabilityAssessmentItems.forEach(item => {
                        var existingItem = this.affordabilityAssessmentAmountLookup.affordabilityAssessmentItems.filter(amount => amount.sourceAffordabilityAssessmentItemId === item.affordabilityAssessmentItemId)[0];
                        item.itemAmount = existingItem?.itemAmount ?? 0;
                    })
                })
            })
        });
        this.affordabilityAssessmentList[0].note = this.affordabilityAssessmentAmountLookup.note;
    }

    public async saveAffordabilityAssessment() {
        this.affordabilityAssessmentList.forEach(assessment => {
            assessment.clientId = this.clientId;
        });

        this.createAffordabilityAssessmentCommand.affordabilityAssessments = this.affordabilityAssessmentList;
        this.createAffordabilityAssessmentCommand.sourceLoanApplicationId = this.loanApplicationId;

        const createAffordabilityAssessmentResponse = await this.clientAffordabilityAssessmentsApiClient.createAffordabilityAssessment(this.createAffordabilityAssessmentCommand!.toJSObject());
        if (createAffordabilityAssessmentResponse.data.success) {
            NotifyUtils.add("Affordability Assessment Saved", "You have successfully saved this affordability assessment.",
                "success" as any, NotificationDuration.Standard);
            this.affordabilityAssessmentList = new List(Platform.AffordabilityAssessmentLookup);
            this.createAffordabilityAssessmentCommand = new Clients.CreateAffordabilityAssessmentCommand();
            this.isAffordabilityAssessmentSubmittedInd = true;
        } else {
            NotifyUtils.add(TextConstants.Titles.ErrorServerSide, "Failed to Save Affordability Assessment.",
                "danger" as any, NotificationDuration.Standard);
        }
    }
}