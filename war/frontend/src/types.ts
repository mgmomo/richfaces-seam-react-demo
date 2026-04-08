export interface LocationDto {
  id: number;
  locationName: string;
  address: string;
  zipCode: string;
  state: string;
  stateLabel: string;
}

export interface PersonDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  locations: LocationDto[];
}

export interface User {
  username: string;
  role: string;
}

export interface DashboardData {
  totalPersons: number;
  totalLocations: number;
  activeLocations: number;
  inactiveLocations: number;
  personsWithNoLocations: number;
  avgLocationsPerPerson: number;
  locationStateDistribution: StateCount[];
  personsPerLocation: LocationPersonCount[];
  recentPersons: PersonDto[];
  recentLocations: LocationDto[];
}

export interface StateCount {
  state: string;
  label: string;
  count: number;
}

export interface LocationPersonCount {
  locationName: string;
  personCount: number;
}
