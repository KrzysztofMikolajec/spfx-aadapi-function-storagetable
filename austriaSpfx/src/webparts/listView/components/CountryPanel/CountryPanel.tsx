import * as React from 'react';
import { ICountryPanelProps, ICountryPanelState } from './ICountryPanelProps';
import {
    autobind
} from 'office-ui-fabric-react';
import styles from './CountryPanel.module.scss';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { ApiService } from '../../services/ApiService'
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export default class CountryPanel extends React.Component<ICountryPanelProps, ICountryPanelState> {

    private apiSvc: ApiService = new ApiService(this.props.context)
    private _viewFields: IViewField[] = [
        {
            name: "Name",
            sorting: true,
            maxWidth: 100
        },
        {
            name: "RowKey",
            displayName: "RowKey",
            maxWidth: 50,
            render: (item: any) => {
                return <span></span>;
            }
        }
    ]

    constructor(props: ICountryPanelProps) {
        super(props);

        this.state = {
            loading: false,
            buttonsDisabled: true,
            hideDialog: true,
            newItem: {
                Name: '',
                RowKey: ''
            },
            countries: this.props.countries
        };
    }
    public render(): React.ReactElement<ICountryPanelProps> {

        const _items: ICommandBarItemProps[] = [
            {
                key: 'New',
                text: 'New',
                iconProps: { iconName: 'Add' },
                onClick: () => {
                    this.setState({
                        hideDialog: false,
                        dialogTitle: 'New country',
                        action: "newCountry"
                    })
                    console.log('NewC')
                },
            },
            {
                key: 'Edit',
                text: 'Edit',
                disabled: this.state.buttonsDisabled,
                iconProps: { iconName: 'Edit' },
                onClick: () => {
                    this.setState({
                        hideDialog: false,
                        dialogTitle: 'Edit country',
                        action: "editCountry"
                      })
                      console.log('EditC')
                },
            },
            {
                key: 'Remove',
                text: 'Remove',
                disabled: this.state.buttonsDisabled,
                iconProps: { iconName: 'Cancel' },
                onClick: () => {
                    this.setState({
                        hideDialog: false,
                        dialogTitle: 'Remove country',
                        action: "removeCountry"
                      })
                      console.log('RemoveC')
                },
            },
        ];

        const _farItems: ICommandBarItemProps[] = [
            {
                key: 'info',
                text: 'Select country and test CRUD',
                // This needs an ariaLabel since it's icon-only
                ariaLabel: 'Info',
                iconOnly: true,
                iconProps: { iconName: 'Info' },
                onClick: () => console.log('Info'),
            },
        ];

        return (
            <div>
                {
                    this.state.loading ?
                        (
                            <Spinner size={SpinnerSize.large} label="Retrieving countries ..." />
                        ) : (
                            <div>
                                <div>
                                    <CommandBar
                                        items={_items}
                                        farItems={_farItems}
                                        ariaLabel="Use left and right arrow keys to navigate between commands"
                                    />
                                </div>
                                <div className={styles.listView}>
                                    <ListView items={this.state.countries}
                                        viewFields={this._viewFields}
                                        compact={false}
                                        selectionMode={SelectionMode.single}
                                        selection={this._getSelection}
                                        showFilter={true}
                                    />
                                </div>
                                <Dialog
                                    hidden={this.state.hideDialog}
                                    onDismiss={this._closeDialog}
                                    dialogContentProps={{
                                        type: DialogType.normal,
                                        title: this.state.dialogTitle
                                    }}
                                    modalProps={{
                                        isBlocking: false
                                    }}
                                >
                                    <TextField
                                        label="Name:"
                                        underlined
                                        required
                                        placeholder="Enter text here"
                                        disabled={this.state.action === 'removeCountry' ? true : false}
                                        value={this.state.newItem.Name}
                                        name='Name'
                                        onKeyUp={this.handleInputChange}
                                    />

                                    <DialogFooter>
                                        <PrimaryButton
                                            onClick={this._saveChanges}
                                            text="Confirm"
                                            disabled={this.state.newItem.Name ? false : true}
                                        />
                                        <DefaultButton onClick={this._closeDialog} text='Cancel' />
                                    </DialogFooter>
                                </Dialog>
                            </div>
                        )
                }
            </div>
        );
    }

    private _saveChanges = (): void => {
        //console.log('newItem', this.state.newItem)
        this.setState({
          loading: true,
          hideDialog: true
        }, () => {
          switch (this.state.action) {
            case 'newCountry':
              this.apiSvc.crudCountryFromApi(this.state.newItem, 'AddCountry').then(res => {
                console.log('addningOutput', res)
                this._getCountries()
              })
              break;
            case 'removeCountry':
              this.apiSvc.crudCountryFromApi(this.state.newItem, 'DeleteCountry').then(res => {
                console.log('addningOutput', res)
                this._getCountries()
              })
              break;
            case 'editCountry':
              this.apiSvc.crudCountryFromApi(this.state.newItem, 'UpdateCountry').then(res => {
                console.log('addningOutput', res)
                this._getCountries()
              })
              break;
            default:
              break;
          }
    
        })
      }

    public handleInputChange = (event) => {

        const target = event.target;
        let value = target.value;
        const name = target.name;

        this.setState({
            newItem: {
                ...this.state.newItem,
                [name]: value
            }
        });

    }

    private _closeDialog = (): void => {
        this.setState({
            hideDialog: true
        });
    }

    @autobind
    private _getSelection(item) {
        this.setState({
            buttonsDisabled: item.length === 0 ? true : false,
            newItem: {
                Name: item.length === 0 ? '' : item[0].Name,
                RowKey: item.length === 0 ? '' : item[0].RowKey
            }
        }, () => { console.log('Selected country:', this.state.newItem) });
    }

    public componentDidMount() {
        // Load the items
        //this._getMockUpUsers();

    }

    @autobind
    private _getCountries() {
        this.apiSvc.getCountriesFromApi().then(res => {
            this.setState({
                countries: res,
                loading: false
            }, () => { console.log('CountriesState', this.state.countries) });;
        })
    }

}
