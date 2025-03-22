
import { Driver } from '@/types/f1';

export const drivers: Driver[] = [
  {
    broadcast_name: "VERSTAPPEN",
    country_code: "NLD",
    driver_number: 1,
    first_name: "Max",
    full_name: "Max VERSTAPPEN",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png",
    last_name: "VERSTAPPEN",
    meeting_key: 1228,
    name_acronym: "VER",
    session_key: 9211,
    team_colour: "#3671C6",
    team_name: "Red Bull Racing"
  },
  {
    broadcast_name: "PEREZ",
    country_code: "MEX",
    driver_number: 11,
    first_name: "Sergio",
    full_name: "Sergio PEREZ",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png",
    last_name: "PEREZ",
    meeting_key: 1228,
    name_acronym: "PER",
    session_key: 9211,
    team_colour: "#3671C6",
    team_name: "Red Bull Racing"
  },
  {
    broadcast_name: "HAMILTON",
    country_code: "GBR",
    driver_number: 44,
    first_name: "Lewis",
    full_name: "Lewis HAMILTON",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png",
    last_name: "HAMILTON",
    meeting_key: 1228,
    name_acronym: "HAM",
    session_key: 9211,
    team_colour: "#6CD3BF",
    team_name: "Mercedes-AMG Petronas F1 Team"
  },
  {
    broadcast_name: "RUSSELL",
    country_code: "GBR",
    driver_number: 63,
    first_name: "George",
    full_name: "George RUSSELL",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png",
    last_name: "RUSSELL",
    meeting_key: 1228,
    name_acronym: "RUS",
    session_key: 9211,
    team_colour: "#6CD3BF",
    team_name: "Mercedes-AMG Petronas F1 Team"
  },
  {
    broadcast_name: "LECLERC",
    country_code: "MON",
    driver_number: 16,
    first_name: "Charles",
    full_name: "Charles LECLERC",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png",
    last_name: "LECLERC",
    meeting_key: 1228,
    name_acronym: "LEC",
    session_key: 9211,
    team_colour: "#F91536",
    team_name: "Scuderia Ferrari"
  },
  {
    broadcast_name: "SAINZ",
    country_code: "ESP",
    driver_number: 55,
    first_name: "Carlos",
    full_name: "Carlos SAINZ",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png",
    last_name: "SAINZ",
    meeting_key: 1228,
    name_acronym: "SAI",
    session_key: 9211,
    team_colour: "#F91536",
    team_name: "Scuderia Ferrari"
  },
  {
    broadcast_name: "NORRIS",
    country_code: "GBR",
    driver_number: 4,
    first_name: "Lando",
    full_name: "Lando NORRIS",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png",
    last_name: "NORRIS",
    meeting_key: 1228,
    name_acronym: "NOR",
    session_key: 9211,
    team_colour: "#F58020",
    team_name: "McLaren F1 Team"
  },
  {
    broadcast_name: "PIASTRI",
    country_code: "AUS",
    driver_number: 81,
    first_name: "Oscar",
    full_name: "Oscar PIASTRI",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png",
    last_name: "PIASTRI",
    meeting_key: 1228,
    name_acronym: "PIA",
    session_key: 9211,
    team_colour: "#F58020",
    team_name: "McLaren F1 Team"
  },
  {
    broadcast_name: "GASLY",
    country_code: "FRA",
    driver_number: 10,
    first_name: "Pierre",
    full_name: "Pierre GASLY",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col/image.png",
    last_name: "GASLY",
    meeting_key: 1228,
    name_acronym: "GAS",
    session_key: 9211,
    team_colour: "#2293D1",
    team_name: "Alpine F1 Team"
  },
  {
    broadcast_name: "OCON",
    country_code: "FRA",
    driver_number: 31,
    first_name: "Esteban",
    full_name: "Esteban OCON",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col/image.png",
    last_name: "OCON",
    meeting_key: 1228,
    name_acronym: "OCO",
    session_key: 9211,
    team_colour: "#2293D1",
    team_name: "Alpine F1 Team"
  }
];

export const getDriverByNumber = (driverNumber: number): Driver | undefined => {
  return drivers.find(driver => driver.driver_number === driverNumber);
};
