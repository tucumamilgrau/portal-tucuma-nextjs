import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa6";
import LiveDateWeather from "./LiveDateWeather";
import LiveExchangeRate from "./LiveExchangeRate";

export default function TopBar() {
  return (
    <div className="bg-support text-white font-menu text-[0.72rem]">
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between gap-4 h-[34px] overflow-x-auto [scrollbar-width:none]">
        <div className="flex items-center gap-3.5 whitespace-nowrap">
          <LiveDateWeather />
          <LiveExchangeRate />
        </div>
        <div className="flex items-center gap-3.5 whitespace-nowrap">
          <div className="flex gap-3 items-center">
            <a
              href="https://www.instagram.com/tucumamilgrau2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="opacity-90 hover:text-primary hover:opacity-100"
            >
              <FaInstagram size={15} />
            </a>
            <a
              href="https://www.facebook.com/tucumamilgrau"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="opacity-90 hover:text-primary hover:opacity-100"
            >
              <FaFacebookF size={15} />
            </a>
          </div>
          <a
            href="https://www.radio-ao-vivo.com/jovem-pan-brasilia"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-90 hover:text-primary hover:opacity-100"
          >
            📻 Rádio ao vivo
          </a>
          <a
            href="https://wa.me/5562982282495?text=Ol%C3%A1%20%2C%20gostaria%20de%20fazer%20uma%20den%C3%BAncia%20ou%20tirar%20alguma%20d%C3%BAvida%20com%20o%20portal%20Tucum%C3%A3%20milgrau.%20"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-support px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
          >
            <FaWhatsapp size={14} /> WhatsApp
          </a>
          <a
            href="https://wa.me/5562982282495?text=Ol%C3%A1%20%2C%20gostaria%20de%20fazer%20uma%20den%C3%BAncia%20ou%20tirar%20alguma%20d%C3%BAvida%20com%20o%20portal%20Tucum%C3%A3%20milgrau.%20"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-alert text-white px-2.5 py-1 rounded-full font-bold"
          >
            🚨 Enviar Denúncia
          </a>
        </div>
      </div>
    </div>
  );
}
