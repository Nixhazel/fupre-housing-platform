/**
 * Universities and Locations Configuration
 *
 * Central config for all supported universities and their common residential areas
 */

export interface UniversityConfig {
	id: string;
	name: string;
	shortName: string;
	state: string;
	locations: string[];
}

/**
 * All supported universities with their locations
 */
export const UNIVERSITIES: UniversityConfig[] = [
	{
		id: 'fupre',
		name: 'Federal University of Petroleum Resources',
		shortName: 'FUPRE',
		state: 'Delta',
		locations: ['Ugbomro', 'Effurun', 'Enerhen', 'PTI Road', 'Airport Road']
	},
	{
		id: 'delsu',
		name: 'Delta State University',
		shortName: 'DELSU',
		state: 'Delta',
		locations: ['Campus', 'Town', 'Oviri Road', 'Medical School']
	},
	{
		id: 'dou',
		name: 'Delta State University of Science and Technology',
		shortName: 'DOU',
		state: 'Delta',
		locations: ['Campus', 'Town']
	},
	{
		id: 'uniben',
		name: 'University of Benin',
		shortName: 'UNIBEN',
		state: 'Edo',
		locations: ['Campus', 'Ekosodin', 'Osasogie', 'Ugbowo']
	},
	{
		id: 'unical',
		name: 'University of Calabar',
		shortName: 'UNICAL',
		state: 'Cross River',
		locations: ['Campus', 'Malabo', 'Ekpo Abasi']
	},
	{
		id: 'unn',
		name: 'University of Nigeria, Nsukka',
		shortName: 'UNN',
		state: 'Enugu',
		locations: ['Campus', 'Odim', 'Onuiyi', 'Town']
	}
];

/**
 * Get university by ID
 */
export function getUniversityById(id: string): UniversityConfig | undefined {
	return UNIVERSITIES.find((u) => u.id === id);
}

/**
 * Get university by short name
 */
export function getUniversityByShortName(shortName: string): UniversityConfig | undefined {
	return UNIVERSITIES.find((u) => u.shortName.toLowerCase() === shortName.toLowerCase());
}

/**
 * Get locations for a university
 */
export function getLocationsForUniversity(universityId: string): string[] {
	const university = getUniversityById(universityId);
	return university?.locations ?? [];
}

/**
 * Check if location is valid for a university
 */
export function isValidLocationForUniversity(universityId: string, location: string): boolean {
	const locations = getLocationsForUniversity(universityId);
	return locations.includes(location);
}

/**
 * Get all university IDs
 */
export const UNIVERSITY_IDS = UNIVERSITIES.map((u) => u.id) as [string, ...string[]];

/**
 * Get all university short names
 */
export const UNIVERSITY_SHORT_NAMES = UNIVERSITIES.map((u) => u.shortName) as [string, ...string[]];

/**
 * Type for university ID
 */
export type UniversityId = (typeof UNIVERSITY_IDS)[number];

/**
 * Get display name for university (short name)
 */
export function getUniversityDisplayName(universityId: string): string {
	const university = getUniversityById(universityId);
	return university?.shortName ?? universityId;
}

/**
 * Get full name for university
 */
export function getUniversityFullName(universityId: string): string {
	const university = getUniversityById(universityId);
	return university?.name ?? universityId;
}
