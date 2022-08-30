import React from 'react';
import { Neo, NeoGrid } from '@singularsystems/neo-react';
import { observer } from 'mobx-react';
import { TextConstants } from '../../../../../Common/TextConstants';
import { SpecificClientTextConstants } from '../../SpecificClientTextConstants';
import CollapsibleCard from '../../../../../App/Components/CollapsibleCard';
import DisplayPortfolioComponentVM from './DisplayPortfolioComponentVM';

interface IDisplayPortfolioComponentProps {
    viewModel: DisplayPortfolioComponentVM;
    onViewDetails: (selectedPortfolioId: number) => number;
}

@observer
export default class DisplayPortfolioComponent extends React.Component<IDisplayPortfolioComponentProps> {

    public render() {
        const viewModel = this.props.viewModel;

        return (
            <div>
                <Neo.Loader task={viewModel.taskRunner}>
                    <CollapsibleCard title={TextConstants.Titles.PortfolioHoldings} isExpanded={true}>

                        {viewModel.portfolioList.length > 0 &&
                            <Neo.GridLayout md={1}>
                                <NeoGrid.Grid items={viewModel.portfolioList}>
                                    {(item, meta) => (
                                        <NeoGrid.Row>
                                            <NeoGrid.Column label={TextConstants.Labels.AccountNumber} display={meta.accountNumber} />
                                            <NeoGrid.Column label={SpecificClientTextConstants.Labels.IndividualOrCompany} display={meta.entityTypeGroup} />
                                            <NeoGrid.Column label={TextConstants.Labels.AccountName} display={meta.investorFullName} />
                                            <NeoGrid.Column label={TextConstants.Labels.PortfolioName} display={meta.portfolioName} />
                                            <NeoGrid.Column
                                                label={TextConstants.Labels.HoldingsMarketValue}
                                                display={meta.portfolioMarketValue}
                                                numProps={{ formatString: TextConstants.StringFormats.FormatString }}
                                                sum={true}
                                            />
                                            <NeoGrid.ButtonColumn>
                                                <Neo.Button
                                                    onClick={() => this.props.onViewDetails(item.portfolioId)}
                                                    variant="primary" >
                                                    <span className="mt-1">{TextConstants.Buttons.ViewDetails}</span>
                                                </Neo.Button>
                                            </NeoGrid.ButtonColumn>
                                        </NeoGrid.Row>)}
                                </NeoGrid.Grid>
                            </Neo.GridLayout>
                        }

                        {viewModel.portfolioList.length === 0 &&
                            <div className="col-md-12 text-center">
                                <p>{TextConstants.GeneralText.NoRecords}</p>
                            </div>
                        }

                    </CollapsibleCard>
                </Neo.Loader>
            </div>
        );
    }
}