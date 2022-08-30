import { List, NeoModel, NotifyUtils } from '@singularsystems/neo-core';
import { Views } from '@singularsystems/neo-react';
import { AppService, Types } from '../../../../../App/Services/AppService';
import { Collateral, Portfolios } from '../../../../../App';
import { TextConstants } from '../../../../../Common/TextConstants';


@NeoModel
export default class DisplayPortfolioComponentVM extends Views.ViewModelBase {

    public portfolioList = new List(Portfolios.PortfolioLookup);
    public getClientHoldingsListByAccountNumbersQuery = new Portfolios.GetClientHoldingsListByAccountNumbersQuery();
    public selectedPortfolioId: number = 0;
    public clientHoldingsList = new List(Portfolios.PortfolioLookup);
    public getAddedPortfolioIdsByIdQuery = new Collateral.GetAddedPortfolioIdsByIdQuery();

    constructor(
        taskRunner = AppService.get(Types.Neo.TaskRunner),
        private portfoliosApiClient = AppService.get(Portfolios.PortfoliosTypes.ApiClients.PortfoliosApiClient),
        private collateralApiClient = AppService.get(Collateral.CollateralTypes.ApiClients.CollateralApiClient),
    ) {
        super(taskRunner);
    }

    public async loadPortfolioListByLoanId(loanId: number) {
        this.getAddedPortfolioIdsByIdQuery.sourceLoanId = loanId;
        await this.loadAddedPortfolios();
    }

    public async load(accountNumber: string, selectedSourceInvestorId: string) {
        this.getClientHoldingsListByAccountNumbersQuery.accountNumbers[0] = accountNumber;
        const getClientHoldingsListResult = await this.taskRunner.run(async () => await this.portfoliosApiClient.getClientHoldingsListByAccountNumbers(this.getClientHoldingsListByAccountNumbersQuery!.toJSObject()));
        if (getClientHoldingsListResult.status === 200) {
            this.portfolioList.set(getClientHoldingsListResult.data);
        } else {
            NotifyUtils.add(TextConstants.Titles.Error, "Failed to load added portfolios from portfolios.",
                "danger" as any, 10);
            this.portfolioList = new List(Portfolios.PortfolioLookup);
        }
    }

    public async loadByPortfolioList(portfolioList: List<Portfolios.PortfolioLookup>) {
        this.portfolioList = portfolioList;
    }

    public async loadAddedPortfolios(loanApplicationId: number = 0) {
        this.getAddedPortfolioIdsByIdQuery.sourceLoanApplicationId = loanApplicationId;
        const getAddedPortfolioIdsById = await this.taskRunner.waitFor(this.collateralApiClient.getAddedPortfolioIdsById(this.getAddedPortfolioIdsByIdQuery!.toJSObject()));

        if (getAddedPortfolioIdsById.status === 200) {
            var getClientHoldingsListByAccountNumbersQuery = new Portfolios.GetClientHoldingsListByAccountNumbersQuery();
            getClientHoldingsListByAccountNumbersQuery.accountNumbers = getAddedPortfolioIdsById.data;
            const getClientHoldingsListByAccountNumbersResponse = await this.portfoliosApiClient.getClientHoldingsListByAccountNumbers(getClientHoldingsListByAccountNumbersQuery!.toJSObject());

            if (getClientHoldingsListByAccountNumbersResponse.status === 200) {
                this.portfolioList.set(getClientHoldingsListByAccountNumbersResponse.data);
            }
            else {
                NotifyUtils.add(TextConstants.Titles.Error, "Failed to load added portfolios from portfolios.",
                    "danger" as any, 10);
            }
        }
        else {
            NotifyUtils.add(TextConstants.Titles.Error, "Failed to load added portfolios from collateral.",
                "danger" as any, 10);
            this.clientHoldingsList = new List(Portfolios.PortfolioLookup);
        }
    }

}