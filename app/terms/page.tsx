import Link from "next/link";
import { ScrollText, CheckCircle } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";

const SECTIONS = [
  {
    title: "1. Objet",
    body: "Darul Arqam est une application d'exploration numérique du Coran fondée sur la science des lettres (ʿIlm al-Ḥurûf) et les valeurs Abjad. Elle est mise à disposition à titre éducatif et contemplatif.",
  },
  {
    title: "2. Utilisation",
    body: "L'application est réservée à un usage personnel, spirituel et académique. Toute exploitation commerciale, reproduction ou redistribution du contenu sans autorisation explicite est interdite.",
  },
  {
    title: "3. Données personnelles",
    body: "Vos données (notes, annotations, préférences) sont stockées de façon privée et sécurisée. Aucune donnée personnelle n'est transmise à des tiers. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis les Paramètres.",
  },
  {
    title: "4. Exactitude des calculs",
    body: "Les valeurs Abjad présentées sont calculées selon la méthode Abjad Kabîr classique, par des fonctions de calcul déterministes. Darul Arqam ne prétend pas à une interprétation doctrinale ou théologique officielle. Les résultats sont fournis à titre indicatif et invitent à la réflexion personnelle.",
  },
  {
    title: "5. Propriété intellectuelle",
    body: "Les textes coraniques sont reproduits selon le standard Uthmani. Les traductions sont issues de sources reconnues. Le code, le design et les analyses originales de Darul Arqam sont protégés par le droit d'auteur.",
  },
  {
    title: "6. Responsabilité",
    body: "Darul Arqam est fourni « en l'état ». Nous ne saurions être tenus responsables d'une mauvaise interprétation des données présentées. L'utilisateur est encouragé à croiser les informations avec des sources savantes reconnues.",
  },
  {
    title: "7. Modifications",
    body: "Ces conditions peuvent être mises à jour. Toute modification substantielle vous sera notifiée lors de votre prochaine connexion. L'utilisation continue de l'application vaut acceptation des nouvelles conditions.",
  },
  {
    title: "8. Contact",
    body: "Pour toute question relative aux présentes conditions, vous pouvez nous contacter à : contact@darularqam.app",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader href="/welcome" eyebrow="Darul Arqam" title="Conditions d'utilisation" />

      <div className="px-5 pt-5 pb-6 flex flex-col gap-4">
        <div className="rounded-xl px-4 py-3 flex items-start gap-3 bg-gold/10 border border-gold/25">
          <ScrollText size={16} className="text-gold-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            En créant un compte sur Darul Arqam, vous acceptez les présentes conditions. Veuillez
            les lire attentivement avant de continuer.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-card rounded-xl border border-border px-4 py-4 flex flex-col gap-2"
          >
            <h3 className="text-sm font-headings font-semibold text-foreground">
              {section.title}
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}

        <p className="text-center text-xs text-muted-foreground font-body">
          Dernière mise à jour : juin 2026
        </p>

        <Link
          href="/register"
          className="w-full py-4 rounded-xl font-headings font-semibold text-base text-primary-foreground bg-gradient-primary flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} /> J&apos;accepte et je crée mon compte
        </Link>
        <Link
          href="/welcome"
          className="w-full py-3.5 rounded-xl font-body font-semibold text-sm text-muted-foreground bg-card border border-border flex items-center justify-center"
        >
          Retour
        </Link>
      </div>
    </div>
  );
}
