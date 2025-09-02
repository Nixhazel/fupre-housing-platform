import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
	return (
		<footer className='bg-muted/50 border-t'>
			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* Brand */}
					<div className='space-y-4'>
						<Link href='/' className='flex items-center space-x-2'>
							<Building2 className='h-8 w-8 text-primary' />
							<span className='text-xl font-bold'>FUPRE Housing</span>
						</Link>
						<p className='text-sm text-muted-foreground'>
							Connecting FUPRE students with quality housing and roommates. Your
							trusted platform for student accommodation in Warri.
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

					{/* Campus Areas */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Popular Areas</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<Link
									href='/listings?area=Ugbomro'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Ugbomro
								</Link>
							</li>
							<li>
								<Link
									href='/listings?area=Effurun'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Effurun
								</Link>
							</li>
							<li>
								<Link
									href='/listings?area=Enerhen'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									Enerhen
								</Link>
							</li>
							<li>
								<Link
									href='/listings?area=PTI Road'
									className='text-muted-foreground hover:text-foreground transition-colors'>
									PTI Road
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
									Federal University of Petroleum Resources,
									<br />
									Effurun, Delta State, Nigeria
								</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Phone className='h-4 w-4 text-muted-foreground' />
								<span className='text-muted-foreground'>+234 801 234 5678</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Mail className='h-4 w-4 text-muted-foreground' />
								<span className='text-muted-foreground'>
									support@fuprehousing.com
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className='border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
					<p className='text-sm text-muted-foreground'>
						© 2024 FUPRE Housing Platform. All rights reserved.
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
