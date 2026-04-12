import Link from 'next/link';

export default function ExpiredLinkPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-[24px]">
      
      {/* LOGO SIMPLIFIÉ */}
      <div className="absolute top-[24px] left-1/2 -translate-x-1/2">
        <h1 className="text-[15px] font-medium text-[#1A1A19]">Melanie Services&Prest.</h1>
      </div>

      <div className="w-full max-w-[420px] flex flex-col items-center mt-[40px]">
        
        {/* ICÔNE LIEN CASSÉ */}
        <svg className="mb-[40px]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>

        {/* MESSAGES */}
        <h2 className="text-[22px] font-medium text-[#1A1A19] text-center">
          Lien expiré ou invalide
        </h2>
        
        <p className="text-[14px] text-[#6B6A67] text-center leading-[1.7] mt-[12px]">
          Ce lien d'accès n'est plus valide. Il a peut-être expiré ou déjà été utilisé. 
          Veuillez contacter Melanie Services&Prest. pour obtenir un nouveau lien d'accès.
        </p>

        {/* BLOC CONTACT */}
        <div className="bg-[#F7F7F6] rounded-[8px] p-[20px] w-full max-w-[320px] mt-[32px] text-center">
          <span className="block text-[13px] font-medium text-[#1A1A19] mb-[8px]">
            Pour obtenir un nouveau lien :
          </span>
          <div className="text-[13px] text-[#6B6A67] leading-[1.8]">
            <a href="mailto:contact@melanieservices.com" className="hover:text-[#1A3A5C] transition-colors block">
              contact@melanieservices.com
            </a>
            <a href="tel:+24206XXXXXXX" className="hover:text-[#1A3A5C] transition-colors block mt-[4px]">
              +242 06 XXX XX XX
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER BAS */}
      <div className="absolute bottom-[24px] w-full text-center">
        <span className="text-[12px] text-[#6B6A67]">© 2026 Melanie Services&Prest.</span>
      </div>

    </div>
  );
}