import { RoommateListing } from '@/types';

export const roommateListingsData: RoommateListing[] = [
	{
		id: '1',
		ownerId: '1',
		ownerType: 'student',
		title: 'Looking for a quiet roommate near Ugbomro',
		budgetMonthly: 25000,
		preferences: {
			gender: 'male',
			cleanliness: 'high',
			studyHours: 'evening',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-01',
		description:
			"I'm a final year student looking for a quiet, focused roommate. I prefer someone who studies in the evening and keeps the place clean. No smoking or pets please.",
		photos: [
			'/images/roommates/roommate1-1.jpg',
			'/images/roommates/roommate1-2.jpg'
		],
		createdAt: '2024-03-01T10:00:00Z'
	},
	{
		id: '2',
		ownerId: '2',
		ownerType: 'student',
		title: 'Fun-loving roommate needed in Effurun',
		budgetMonthly: 30000,
		preferences: {
			gender: 'female',
			cleanliness: 'medium',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'yes'
		},
		moveInDate: '2024-03-15',
		description:
			'Looking for a fun, social roommate who loves pets! I have a small dog and would love someone who enjoys outdoor activities and socializing.',
		photos: [
			'/images/roommates/roommate2-1.jpg',
			'/images/roommates/roommate2-2.jpg',
			'/images/roommates/roommate2-3.jpg'
		],
		createdAt: '2024-02-28T10:00:00Z'
	},
	{
		id: '3',
		ownerId: '7',
		ownerType: 'owner',
		title: 'Room available for responsible student',
		budgetMonthly: 35000,
		preferences: {
			gender: 'any',
			cleanliness: 'high',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-15',
		description:
			'I have a spare room in my house near PTI Road. Looking for a responsible, clean student who respects the house rules. Quiet environment, perfect for studying.',
		photos: [
			'/images/roommates/roommate3-1.jpg',
			'/images/roommates/roommate3-2.jpg'
		],
		createdAt: '2024-03-05T10:00:00Z'
	},
	{
		id: '4',
		ownerId: '3',
		ownerType: 'student',
		title: 'Gaming buddy roommate wanted',
		budgetMonthly: 28000,
		preferences: {
			gender: 'male',
			cleanliness: 'medium',
			studyHours: 'night',
			smoking: 'outdoor_only',
			pets: 'no'
		},
		moveInDate: '2024-03-20',
		description:
			'Looking for a fellow gamer who studies late at night. I have a gaming setup and would love someone who shares the same interests. Outdoor smoking is okay.',
		photos: [
			'/images/roommates/roommate4-1.jpg',
			'/images/roommates/roommate4-2.jpg'
		],
		createdAt: '2024-03-08T10:00:00Z'
	},
	{
		id: '5',
		ownerId: '8',
		ownerType: 'owner',
		title: 'Furnished room for female student',
		budgetMonthly: 40000,
		preferences: {
			gender: 'female',
			cleanliness: 'high',
			studyHours: 'morning',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-01',
		description:
			'Beautiful furnished room available for a female student. I prefer someone who studies in the morning and keeps the place very clean. No smoking or pets.',
		photos: [
			'/images/roommates/roommate5-1.jpg',
			'/images/roommates/roommate5-2.jpg',
			'/images/roommates/roommate5-3.jpg'
		],
		createdAt: '2024-03-10T10:00:00Z'
	},
	{
		id: '6',
		ownerId: '11',
		ownerType: 'student',
		title: 'Study partner roommate needed',
		budgetMonthly: 32000,
		preferences: {
			gender: 'any',
			cleanliness: 'high',
			studyHours: 'evening',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-03-25',
		description:
			"I'm a graduate student looking for a study partner roommate. I prefer someone who is serious about academics and keeps the place clean for focused studying.",
		photos: [
			'/images/roommates/roommate6-1.jpg',
			'/images/roommates/roommate6-2.jpg'
		],
		createdAt: '2024-03-12T10:00:00Z'
	},
	{
		id: '7',
		ownerId: '9',
		ownerType: 'owner',
		title: 'Room with garden access',
		budgetMonthly: 45000,
		preferences: {
			gender: 'any',
			cleanliness: 'medium',
			studyHours: 'flexible',
			smoking: 'outdoor_only',
			pets: 'yes'
		},
		moveInDate: '2024-04-10',
		description:
			'Spacious room with access to a beautiful garden. Perfect for someone who loves nature and outdoor activities. Pet-friendly environment.',
		photos: [
			'/images/roommates/roommate7-1.jpg',
			'/images/roommates/roommate7-2.jpg',
			'/images/roommates/roommate7-3.jpg'
		],
		createdAt: '2024-03-15T10:00:00Z'
	},
	{
		id: '8',
		ownerId: '12',
		ownerType: 'student',
		title: 'Music lover roommate wanted',
		budgetMonthly: 27000,
		preferences: {
			gender: 'any',
			cleanliness: 'medium',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-03-30',
		description:
			'Looking for a roommate who loves music! I play guitar and would love someone who appreciates music. Flexible study hours and medium cleanliness is fine.',
		photos: [
			'/images/roommates/roommate8-1.jpg',
			'/images/roommates/roommate8-2.jpg'
		],
		createdAt: '2024-03-18T10:00:00Z'
	},
	{
		id: '9',
		ownerId: '16',
		ownerType: 'owner',
		title: 'Quiet room for focused student',
		budgetMonthly: 38000,
		preferences: {
			gender: 'any',
			cleanliness: 'high',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-05',
		description:
			'Very quiet room in a peaceful neighborhood. Perfect for students who need a calm environment for studying. High cleanliness standards required.',
		photos: [
			'/images/roommates/roommate9-1.jpg',
			'/images/roommates/roommate9-2.jpg'
		],
		createdAt: '2024-03-20T10:00:00Z'
	},
	{
		id: '10',
		ownerId: '18',
		ownerType: 'student',
		title: 'Fitness enthusiast roommate needed',
		budgetMonthly: 33000,
		preferences: {
			gender: 'female',
			cleanliness: 'high',
			studyHours: 'morning',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-20',
		description:
			'Looking for a fitness enthusiast roommate! I go to the gym early in the morning and would love someone who shares the same healthy lifestyle.',
		photos: [
			'/images/roommates/roommate10-1.jpg',
			'/images/roommates/roommate10-2.jpg',
			'/images/roommates/roommate10-3.jpg'
		],
		createdAt: '2024-03-22T10:00:00Z'
	},
	{
		id: '11',
		ownerId: '17',
		ownerType: 'owner',
		title: 'Room with kitchen privileges',
		budgetMonthly: 42000,
		preferences: {
			gender: 'any',
			cleanliness: 'high',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-15',
		description:
			'Room available with full kitchen privileges. I love cooking and would enjoy sharing meals with a roommate who also enjoys cooking.',
		photos: [
			'/images/roommates/roommate11-1.jpg',
			'/images/roommates/roommate11-2.jpg'
		],
		createdAt: '2024-03-25T10:00:00Z'
	},
	{
		id: '12',
		ownerId: '19',
		ownerType: 'student',
		title: 'Art student roommate wanted',
		budgetMonthly: 29000,
		preferences: {
			gender: 'any',
			cleanliness: 'medium',
			studyHours: 'flexible',
			smoking: 'no',
			pets: 'no'
		},
		moveInDate: '2024-04-01',
		description:
			"I'm an art student looking for a creative roommate. I work on projects at various times and need someone who understands the creative process.",
		photos: [
			'/images/roommates/roommate12-1.jpg',
			'/images/roommates/roommate12-2.jpg'
		],
		createdAt: '2024-03-28T10:00:00Z'
	}
];
