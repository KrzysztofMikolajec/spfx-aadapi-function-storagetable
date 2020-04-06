import { IApiService } from './IApiService'
import { AadHttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IUser } from '../models/IUser';
import { ICountry } from '../models/ICountry';

export class ApiService implements IApiService {
    private context: WebPartContext;
    constructor(context) {
        this.context = context;
    }

    private users: IUser[];

    public getMockupData() {
        this.users = [
            {
                FirstName: 'Hans',
                LastName: 'Hansen',
                Country: 'Germany',
                RowKey: ''
            },
            {
                FirstName: 'John',
                LastName: 'Johnson',
                Country: 'England',
                RowKey: ''
            },
            {
                FirstName: 'Franz',
                LastName: 'Beckenbauer',
                Country: 'Germany',
                RowKey: ''
            }
        ]
        return this.users;
    }

    public getUsersFromApi(): Promise<any> {

        // Create an AadHttpClient object to consume a 3rd party API
        const aadClient: AadHttpClient = new AadHttpClient(
            this.context.serviceScope,
            "bcfac1e7-f035-44f3-8e9c-b71e312eb10e"
        );

        console.log("Created aadClient");

        const requestOptions: IHttpClientOptions = {
            body: JSON.stringify({
                "RowKey": "all"
            })
        };

        // Search for the users with givenName, surname, or displayName equal to the searchFor value
        return aadClient
            .post(
                `https://austriafunction.azurewebsites.net/api/StorageTable?Operation=ReadUsers`,
                AadHttpClient.configurations.v1,
                requestOptions
            )
            .then(response => {
                return response.json()
            })
            .then(jsonUsers => {

                // Log the result in the console for testing purposes
                //console.log('l Users', jsonUsers.length);

                return aadClient
                    .post(
                        `https://austriafunction.azurewebsites.net/api/StorageTable?Operation=ReadCountries`,
                        AadHttpClient.configurations.v1,
                        requestOptions
                    )
                    .then(response => {
                        return response.json()
                    })
                    .then(jsonCountries => {
                        //console.log('Countries', jsonCountries);

                        const users = jsonUsers.length === undefined ? [jsonUsers].map((user) => {
                            return {
                                FirstName: user.FirstName,
                                LastName: user.LastName,
                                Country: user.LocationId ? jsonCountries.filter((country) => { return (country.RowKey === user.LocationId) })[0].Name : 'Empty',
                                RowKey: user.RowKey
                            } as IUser;

                        }) :
                            [...jsonUsers].map((user) => {
                                return {
                                    FirstName: user.FirstName,
                                    LastName: user.LastName,
                                    Country: user.LocationId ? jsonCountries.filter((country) => { return (country.RowKey === user.LocationId) })[0].Name : 'Empty',
                                    RowKey: user.RowKey
                                } as IUser;

                            })

                        return users;

                    })
                    .catch(error => {
                        console.error(error);
                    });

            })
            .catch(error => {
                console.error(error);
            });
    }

    public getCountriesFromApi(): Promise<any> {

        // Create an AadHttpClient object to consume a 3rd party API
        const aadClient: AadHttpClient = new AadHttpClient(
            this.context.serviceScope,
            "bcfac1e7-f035-44f3-8e9c-b71e312eb10e"
        );

        console.log("Created aadClient");

        const requestOptions: IHttpClientOptions = {
            body: JSON.stringify({
                "RowKey": "all"
            })
        };

        // Search for the users with givenName, surname, or displayName equal to the searchFor value   
        return aadClient
            .post(
                `https://austriafunction.azurewebsites.net/api/StorageTable?Operation=ReadCountries`,
                AadHttpClient.configurations.v1,
                requestOptions
            )
            .then(response => {
                return response.json()
            })
            .then(jsonCountries => {

                //console.log('Countries', jsonCountries);

                const countries = jsonCountries.map((country) => {
                    return {
                        Name: country.Name,
                        RowKey: country.RowKey
                    } as ICountry;

                });

                return countries;

            })
            .catch(error => {
                console.error(error);
            });

    }

    public crudUserFromApi(user, operation): Promise<any> {

        // Create an AadHttpClient object to consume a 3rd party API
        const aadClient: AadHttpClient = new AadHttpClient(
            this.context.serviceScope,
            "bcfac1e7-f035-44f3-8e9c-b71e312eb10e"
        );

        console.log("Created aadClient");
        let jsonBody
        switch (operation) {
            case 'AddUser':
                jsonBody = {
                    "FirstName": user.FirstName,
                    "LastName": user.LastName,
                    "LocationId": user.LocationId
                };
                break;
            case 'DeleteUser':
                jsonBody = {
                    "RowKey": user.RowKey
                };
                break;
            case 'UpdateUser':
                jsonBody = {
                    "RowKey": user.RowKey,
                    "FirstName": user.FirstName,
                    "LastName": user.LastName,
                    "LocationId": user.LocationId
                };
                break;
            default:
                break;
        }

        const requestOptions: IHttpClientOptions = {
            body: JSON.stringify(jsonBody)
        };

        console.log('userTocrud', user)
        console.log('operation', operation)

        // Search for the users with givenName, surname, or displayName equal to the searchFor value   
        return aadClient
            .post(
                `https://austriafunction.azurewebsites.net/api/StorageTable?Operation=${operation}`,
                AadHttpClient.configurations.v1,
                requestOptions
            )
            .then(response => {
                return response.json()
            })
            .then(user => {

                //console.log('Countries', jsonCountries);

                return user;

            })
            .catch(error => {
                console.error(error);
            });

    }

    public crudCountryFromApi(country, operation): Promise<any> {

        // Create an AadHttpClient object to consume a 3rd party API
        const aadClient: AadHttpClient = new AadHttpClient(
            this.context.serviceScope,
            "bcfac1e7-f035-44f3-8e9c-b71e312eb10e"
        );

        console.log("Created aadClient");
        let jsonBody
        switch (operation) {
            case 'AddCountry':
                jsonBody = {
                    "Name": country.Name
                };
                break;
            case 'DeleteCountry':
                jsonBody = {
                    "RowKey": country.RowKey
                };
                break;
            case 'UpdateCountry':
                jsonBody = {
                    "RowKey": country.RowKey,
                    "Name": country.Name
                };
                break;
            default:
                break;
        }

        const requestOptions: IHttpClientOptions = {
            body: JSON.stringify(jsonBody)
        };

        console.log('countryTocrud', country)
        console.log('countryoperation', operation)

        // Search for the users with givenName, surname, or displayName equal to the searchFor value   
        return aadClient
            .post(
                `https://austriafunction.azurewebsites.net/api/StorageTable?Operation=${operation}`,
                AadHttpClient.configurations.v1,
                requestOptions
            )
            .then(response => {
                return response.json()
            })
            .then(country => {

                //console.log('Countries', jsonCountries);

                return country;

            })
            .catch(error => {
                console.error(error);
            });

    }

}