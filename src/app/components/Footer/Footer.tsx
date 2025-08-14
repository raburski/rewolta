import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerContent}>
				<div className={styles.footerSection}>
					<h3>Architektoniczna Rewolta</h3>
					<p>Pospolite ruszenie przeciwko dalszemu oszpecaniu naszych miast</p>
				</div>
				
				<div className={styles.footerSection}>
					<h4>Dołącz do nas</h4>
					<div className={styles.footerLinks}>
						<a href="https://www.facebook.com/groups/691257419756556/" target="_blank" rel="noopener noreferrer">
							🇵🇱 Grupa na Facebooku
						</a>
						<a href="https://www.facebook.com/groups/ArchitecturalUprising" target="_blank" rel="noopener noreferrer">
							🌐 Grupa międzynarodowa
						</a>
						<a href="https://www.architecturaluprising.com/" target="_blank" rel="noopener noreferrer">
							🇬🇧 Anglojęzyczna strona
						</a>
					</div>
				</div>

				<div className={styles.footerSection}>
					<h4>Przydatne linki</h4>
					<div className={styles.footerLinks}>
						<Link href="/meme">
							🎨 Generator memów
						</Link>
						<a href="https://uprisingmap.com/" target="_blank" rel="noopener noreferrer">
							🌍 Mapa rewolt
						</a>
					</div>
				</div>

				<div className={styles.footerSection}>
					<h4>Prawne</h4>
					<div className={styles.footerLinks}>
						<Link href="/privacy">
							🔒 Polityka prywatności
						</Link>
						<Link href="/terms">
							📋 Regulamin
						</Link>
					</div>
				</div>
			</div>
			
		</footer>
	)
} 