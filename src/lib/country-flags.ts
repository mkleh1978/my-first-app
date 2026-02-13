/** Country name → ISO 3166-1 Alpha-2 mapping for all 47 countries in the database */
const COUNTRY_TO_ISO: Record<string, string> = {
  Albania: "AL",
  Andorra: "AD",
  Armenia: "AM",
  Austria: "AT",
  Azerbaijan: "AZ",
  Belarus: "BY",
  Belgium: "BE",
  "Bosnia and Herzegovina": "BA",
  Bulgaria: "BG",
  Croatia: "HR",
  Cyprus: "CY",
  Czechia: "CZ",
  "Czech Republic": "CZ",
  Denmark: "DK",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Greece: "GR",
  Hungary: "HU",
  Iceland: "IS",
  Ireland: "IE",
  Italy: "IT",
  Kosovo: "XK",
  Latvia: "LV",
  Liechtenstein: "LI",
  Lithuania: "LT",
  Luxembourg: "LU",
  Malta: "MT",
  Moldova: "MD",
  Monaco: "MC",
  Montenegro: "ME",
  Netherlands: "NL",
  "North Macedonia": "MK",
  Norway: "NO",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Russia: "RU",
  Serbia: "RS",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Turkey: "TR",
  Ukraine: "UA",
  "United Kingdom": "GB",
  UK: "GB",
  "Great Britain": "GB",
};

/**
 * Get the lowercase ISO 3166-1 Alpha-2 code for a country name.
 * Returns null for unknown countries.
 */
export function countryToIso(country: string | null): string | null {
  if (!country) return null;
  const iso = COUNTRY_TO_ISO[country];
  return iso ? iso.toLowerCase() : null;
}
