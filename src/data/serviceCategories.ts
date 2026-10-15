import { ServiceCategory } from "@/components/home/ServiceCategories";
import PedreiroIcon from '@/assets/icons/pedreiro-card.svg';
import PintorIcon from "@/assets/icons/pintor.svg";
import EletricistaIcon from "@/assets/icons/eletricista.svg";
import EncanadorIcon from "@/assets/icons/encanador.svg";
import EngenheiroIcon from "@/assets/icons/engenheiro.svg";
import ArquitetoIcon from "@/assets/icons/arquiteto.svg";
import MarceneiroIcon from "@/assets/icons/marceneiro.svg";
import JardineiroIcon from "@/assets/icons/jardineiro.svg";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "pedreiro",
    name: "Pedreiro",
    icon: "https://i.imgur.com/v1ru1gg.png",
    description: "Construção e reforma",
    color: "bg-orange-light"
  },
  {
    id: "pintor",
    name: "Pintor",
    icon: PintorIcon,
    description: "Pintura residencial e comercial",
    color: "bg-blue-100/80"
  },
  {
    id: "eletricista",
    name: "Eletricista",
    icon: EletricistaIcon,
    description: "Instalações elétricas",
    color: "bg-yellow-100/80"
  },
  {
    id: "encanador",
    name: "Encanador",
    icon: EncanadorIcon,
    description: "Instalações hidráulicas",
    color: "bg-cyan-100/80"
  },
  {
    id: "engenheiro",
    name: "Engenheiro",
    icon: EngenheiroIcon,
    description: "Projetos e consultoria",
    color: "bg-green-100/80"
  },
  {
    id: "arquiteto",
    name: "Arquiteto",
    icon: ArquitetoIcon,
    description: "Projetos arquitetônicos",
    color: "bg-purple-100/80"
  },
  {
    id: "marceneiro",
    name: "Marceneiro",
    icon: MarceneiroIcon,
    description: "Móveis sob medida",
    color: "bg-amber-100/80"
  },
  {
    id: "jardineiro",
    name: "Jardineiro",
    icon: JardineiroIcon,
    description: "Paisagismo e jardinagem",
    color: "bg-emerald-100/80"
  }
];