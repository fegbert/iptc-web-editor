interface Timezone {
  name: string
  abbreviation: string
  offset: string
}

export const timezones: Timezone[] = [
  { offset: '-1200', abbreviation: 'AoE', name: 'Anywhere on Earth' },
  { offset: '-1100', abbreviation: 'SST', name: 'Samoa Standard Time' },
  { offset: '-1000', abbreviation: 'HST', name: 'Hawaii Standard Time' },
  { offset: '-0900', abbreviation: 'AKST', name: 'Alaska Standard Time' },
  { offset: '-0800', abbreviation: 'PST', name: 'Pacific Standard Time' },
  { offset: '-0700', abbreviation: 'PDT', name: 'Pacific Daylight Time' },
  { offset: '-0700', abbreviation: 'MST', name: 'Mountain Standard Time' },
  { offset: '-0600', abbreviation: 'CST', name: 'Central Standard Time' },
  { offset: '-0600', abbreviation: 'MDT', name: 'Mountain Daylight Time' },
  { offset: '-0500', abbreviation: 'EST', name: 'Eastern Standard Time' },
  { offset: '-0400', abbreviation: 'EDT', name: 'Eastern Daylight Time' },
  { offset: '-0400', abbreviation: 'AST', name: 'Atlantic Standard Time' },
  { offset: '-0300', abbreviation: 'BRT', name: 'Brasília Time' },
  { offset: '-0200', abbreviation: 'FNT', name: 'Fernando de Noronha Time' },
  { offset: '-0100', abbreviation: 'AZOT', name: 'Azores Standard Time' },
  { offset: '+0000', abbreviation: 'UTC', name: 'Coordinated Universal Time' },
  { offset: '+0100', abbreviation: 'CET', name: 'Central European Time' },
  { offset: '+0200', abbreviation: 'EET', name: 'Eastern European Time' },
  { offset: '+0300', abbreviation: 'MSK', name: 'Moscow Standard Time' },
  { offset: '+0400', abbreviation: 'GST', name: 'Gulf Standard Time' },
  { offset: '+0500', abbreviation: 'PKT', name: 'Pakistan Standard Time' },
  { offset: '+0530', abbreviation: 'IST', name: 'India Standard Time' },
  { offset: '+0600', abbreviation: 'BST', name: 'Bangladesh Standard Time' },
  { offset: '+0700', abbreviation: 'ICT', name: 'Indochina Time' },
  { offset: '+0800', abbreviation: 'CST', name: 'China Standard Time' },
  { offset: '+0900', abbreviation: 'JST', name: 'Japan Standard Time' },
  { offset: '+1000', abbreviation: 'AEST', name: 'Australian Eastern Standard Time' },
  { offset: '+1100', abbreviation: 'SBT', name: 'Solomon Islands Time' },
  { offset: '+1200', abbreviation: 'NZST', name: 'New Zealand Standard Time' },
  { offset: '+1300', abbreviation: 'TOT', name: 'Tonga Time' },
  { offset: '+1400', abbreviation: 'LINT', name: 'Line Islands Time' },
]
