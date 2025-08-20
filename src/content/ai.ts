export interface BuildingProduct {
	id: string
	name: string
	imageUrl: string
	description: string
	cdnUrl: string
}

export const buildingProducts: BuildingProduct[] = [
	{
		id: 'museum',
		name: 'Rozbudowa Muzeum Architektury',
		imageUrl: 'https://imgen-proxy.b-cdn.net/references/museum-small.png',
		description: 'Generuj unikalne budynki inspirowane Muzeum Architektury we Wrocławiu',
		cdnUrl: 'https://imgen-proxy.b-cdn.net/references/museum-small.png'
	},
	{
		id: 'muzeum-ksiazat-lubomirskich',
		name: 'Muzeum Książąt Lubomirskich',
		imageUrl: 'https://imgen-proxy.b-cdn.net/references/muzeum-ksiazat-lubomirskich1.jpg',
		description: 'Podmień planowany budynek muzeum na coś bardziej w twoim stylu',
		cdnUrl: 'https://imgen-proxy.b-cdn.net/references/muzeum-ksiazat-lubomirskich1.jpg'
	}
] 