import Image from "next/image";

/**
 * A warm, tactile corner of Mademoiselle l'Abeille's world. The character is
 * always a validated illustration; the surrounding objects are deliberately
 * quiet so they never compete with her.
 */
export function HeroScene({ beeAlt }: { beeAlt: string }) {
  return (
    <div className="hero-world relative mx-auto h-[430px] w-full max-w-[620px] select-none sm:h-[540px]">
      <div aria-hidden="true" className="hero-watercolor-wash" />
      <div aria-hidden="true" className="hero-cloud hero-cloud-one" />
      <div aria-hidden="true" className="hero-cloud hero-cloud-two" />

      <div aria-hidden="true" className="hero-bouquet">
        <span className="flower flower-large" />
        <span className="flower flower-small" />
        <span className="flower flower-honey" />
        <i className="stem stem-one" />
        <i className="stem stem-two" />
        <i className="leaf leaf-one" />
        <i className="leaf leaf-two" />
      </div>

      <div aria-hidden="true" className="hero-rug">
        <span className="hero-rug-fringe hero-rug-fringe-left" />
        <span className="hero-rug-fringe hero-rug-fringe-right" />
      </div>
      <div aria-hidden="true" className="hero-cushion" />
      <div aria-hidden="true" className="hero-throw">
        <span className="hero-throw-stitch hero-throw-stitch-one" />
        <span className="hero-throw-stitch hero-throw-stitch-two" />
      </div>

      <Image
        src="/illustrations/abeille-sereine/card.webp"
        alt={beeAlt}
        width={800}
        height={800}
        priority
        sizes="(max-width: 640px) 58vw, 330px"
        className="animate-forage absolute bottom-[92px] left-[13%] z-10 w-[49%] rounded-[42%] drop-shadow-[0_18px_20px_rgba(100,68,38,0.13)]"
      />

      <div aria-hidden="true" className="hero-cup">
        <span>♡</span>
      </div>
      <div aria-hidden="true" className="hero-honey">
        <span>Miel<br /><small>de tendresse</small></span>
      </div>
      <div aria-hidden="true" className="hero-honey-spoon" />
      <div aria-hidden="true" className="hero-petals">
        <i />
        <i />
        <i />
      </div>
      <div aria-hidden="true" className="hero-ground" />
    </div>
  );
}
