import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
	return (
		<footer className='bg-muted/50 border-t'>
			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
				{/* Brand */}
				<div className='space-y-4'>
					<Link href='/' className='flex items-center space-x-2'>
						<Image
							src='/images/easyvill-logo.png'
							alt='EasyVille Estates'
							width={40}
							height={40}
							className='h-10 w-10 object-contain'
						/>
						<span className='text-xl font-bold'>EasyVille Estates</span>
					</Link>
					<p className='text-sm text-muted-foreground'>
						Your trusted platform for quality student housing and roommates
						near campus. Find your perfect accommodation today.
					</p>
				</div>

					{/* Quick Links */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Quick Links</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link
									href='/listings'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Browse Listings
								</Link>
							</li>
							<li>
								<Link
									href='/roommates'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Find Roommates
								</Link>
							</li>
							<li>
								<Link
									href='/auth/register'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Become an Agent
								</Link>
							</li>
							<li>
								<Link
									href='/help'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Help Center
								</Link>
							</li>
						</ul>
					</div>

					{/* Universities */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Universities</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link
									href='/listings?university=fupre'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									FUPRE
								</Link>
							</li>
							<li>
								<Link
									href='/listings?university=delsu'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									DELSU
								</Link>
							</li>
							<li>
								<Link
									href='/listings?university=uniben'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									UNIBEN
								</Link>
							</li>
							<li>
								<Link
									href='/listings?university=unn'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									UNN
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Contact Info</h3>
						<div className='space-y-3 text-sm'>
							<div className='flex items-center space-x-2'>
								<MapPin className='h-4 w-4 text-muted-foreground' />
								<span className='text-muted-foreground'>
									11 Asama Avenue, Osubi,
									<br />
									Delta State, Nigeria
								</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Phone className='h-4 w-4 text-muted-foreground' />
								<span className='text-muted-foreground'>+234 704 848 9342</span>
							</div>
							<div className='flex items-center space-x-2'>
						<Mail className='h-4 w-4 text-muted-foreground' />
							<span className='text-muted-foreground'>
								support@easyvilleestates.com
							</span>
							</div>
						</div>
					</div>
				</div>

				<div className='border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
					<p className='text-sm text-muted-foreground'>
						© 2025 EasyVille Estates. All rights reserved.
					</p>
					<div className='flex space-x-6 mt-4 md:mt-0'>
						<Link
							href='/privacy'
							className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
							Privacy Policy
						</Link>
						<Link
							href='/terms'
							className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
							Terms of Service
						</Link>
						<Link
							href='/about'
							className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
							About Us
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
