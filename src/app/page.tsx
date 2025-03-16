import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Architektoniczna Rewolta</h1>
          <span>Pospolite ruszenie przeciwko dalszemu oszpecaniu naszych miast</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.grid}>
          <a href="https://www.facebook.com/groups/691257419756556/" className={styles.card} target="_blank">
            <h2>Dołącz do nas <span>-&gt;</span></h2>
            <p>🇵🇱&nbsp;&nbsp;Aktywna grupa na facebooku.</p>
          </a>

          <a href="https://www.facebook.com/groups/ArchitecturalUprising" className={styles.card} target="_blank">
            <h2>Za granicą <span>-&gt;</span></h2>
            <p>🌐&nbsp;&nbsp;Międzynarodowa grupa na fb.</p>
          </a>

          <a href="https://www.architecturaluprising.com/" className={styles.card} target="_blank">
            <h2>Więcej o rewolcie <span>-&gt;</span></h2>
            <p>🇬🇧&nbsp;&nbsp;Gdzie wszystko się zaczęło!</p>
          </a>

          <a href="https://mapa.rewolta.org/" className={styles.card} target="_blank">
            <h2>Mapa świata <span>-&gt;</span></h2>
            <p>🌍&nbsp;&nbsp;Wszystkie lokalne rewolty</p>
          </a>

          <Link href="/meme" className={styles.card}>
            <h2>Memy <span>-&gt;</span></h2>
            <p>🎨&nbsp;&nbsp;Stwórz rewoltowego mema</p>
          </Link>
        </div>

        <div className={styles.center}>
          <div className={styles.map}>
              <div className={styles.emblems}>
                <a href="https://www.facebook.com/profile.php?id=61559270555090" target="_blank">
                  <Image
                    src="/emblem/wro6.png"
                    alt="Wrocław"
                    id="emblemWro"
                    className={styles.emblem}
                    width={78}
                    height={78}
                  />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61556982112973" target="_blank">
                  <Image
                    src="/emblem/stettin.png"
                    alt="Szczecin"
                    id="emblemStettin"
                    className={styles.emblem}
                    width={78}
                    height={78}
                  />
                </a>
                <a href="https://www.facebook.com/groups/691257419756556" target="_blank">
                  <Image
                    src="/emblem/polska.png"
                    alt="Polska"
                    id="emblemPolska"
                    className={styles.emblem}
                    width={116}
                    height={116}
                  />
                </a>
              </div>
              <Image
                src="/polska.svg"
                alt="Polska"
                className={styles.polandMap}
                width={640}
                height={640}
              />
            </div>
        </div>
      </div>
    </main>
  );
}
