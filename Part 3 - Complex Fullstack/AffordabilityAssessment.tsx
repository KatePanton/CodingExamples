import React from 'react';
import { Neo } from '@singularsystems/neo-react';
import { observer } from 'mobx-react';
import { TextConstants } from '../../../../../Common/TextConstants';
import { NumberFormat } from '@singularsystems/neo-core/dist/NumberUtils';
import { SpecificClientTextConstants } from '../../SpecificClientTextConstants';
import CollapsibleCard from '../../../../../App/Components/CollapsibleCard';
import SelectAffordabilityAssessmentComponentVM from './SelectAffordabilityAssessmentComponentVM';

interface ISelectAffordabilityAssessmentComponentProps {
    viewModel: SelectAffordabilityAssessmentComponentVM;
    onSave: () => void;
    onPrevious: () => void;
}

@observer
export default class SelectAffordabilityAssessmentComponent extends React.Component<ISelectAffordabilityAssessmentComponentProps> {

    private GenerateAffordabilityAssessmentComponent() {
        const AA_Array = this.props.viewModel.affordabilityAssessmentList;
        const myArrCreatedFromMap = AA_Array.map(assessment => (
            <div>
                <Neo.GridLayout md={2}>
                    <div className={'p-2'}>
                        <Neo.GridLayout md={1}>
                            {assessment.affordabilityAssessmentElements.map(element => (
                                <div>
                                    {element.affordabilityAssessmentGroupings.map(group => (
                                        <div>
                                            <p className={'inTextTitle'}><b>{group.groupingLabel}</b></p>
                                            {group.affordabilityAssessmentItems.map(item => (
                                                <div>
                                                    <Neo.FormGroup
                                                        label={item.itemLabel}
                                                        bind={item.meta.itemAmount}
                                                        numProps={{ format: NumberFormat.CurrencyDecimals }}
                                                        onBlur={() => item.meta.itemAmount.value *= item.meta.amountSymbol.value}
                                                    />
                                                </div>
                                            ))}
                                            <Neo.FormGroup
                                                label={group.groupingTotalNameCalculated}
                                                isReadOnly display={group.meta.groupingTotalAmountCalculated}
                                                numProps={{ format: NumberFormat.CurrencyDecimals }}
                                            />
                                        </div>
                                    ))}
                                    <Neo.FormGroup
                                        label={element.elementTotalNameCalculated}
                                        isReadOnly display={element.meta.elementTotalAmountCalculated}
                                        numProps={{ format: NumberFormat.CurrencyDecimals }}
                                    />
                                </div>
                            ))}
                            <Neo.FormGroup
                                label={assessment.affordabilityAssessmentTotalName}
                                isReadOnly display={assessment.meta.affordabilityAssessmentTotalAmountCalculated}
                                className={assessment.affordabilityAssessmentTotalAmountCalculated > 0 ? 'positiveAmount' : 'negativeAmount'}
                                numProps={{ format: NumberFormat.CurrencyDecimals }}
                            />
                            <Neo.FormGroup
                                label={SpecificClientTextConstants.Labels.SourcesOfOtherIncome}
                                bind={assessment.meta.note}
                                input={{ rows: 3 }}
                            />
                        </Neo.GridLayout>
                    </div>
                </Neo.GridLayout>
            </div>
        ));

        var assessmentCard: JSX.Element = (
            <div>{myArrCreatedFromMap}</div>
        )

        return assessmentCard;
    }

    public render() {
        const viewModel = this.props.viewModel;

        return (
            <div>
                <Neo.Loader task={viewModel.taskRunner}>
                    <CollapsibleCard title={TextConstants.Titles.AffordabilityAssessmentInput} isExpanded={true}>

                        {viewModel.affordabilityAssessmentList.length > 0 &&
                            this.GenerateAffordabilityAssessmentComponent()
                        }

                        {viewModel.affordabilityAssessmentList.length === 0 &&
                            <div className="col-md-12 text-center">
                                <p>{TextConstants.GeneralText.UnableToLoadDetails}</p>
                            </div>
                        }
                    </CollapsibleCard>

                    <div>
                        <Neo.Button
                            onClick={() => this.props.onSave()}
                            variant={"primary"} isOutline className="float-right ml-3 col-md-1"
                        >{TextConstants.Buttons.Save}</Neo.Button>

                        <Neo.Button
                            onClick={() => this.props.onPrevious()}
                            variant="primary" isOutline className="col-md-1"
                        >{TextConstants.Buttons.Previous}</Neo.Button>
                    </div>
                </Neo.Loader>
            </div>
        );
    }
}