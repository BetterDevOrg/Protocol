export type Partner = {
  id: string;
  name: string;
  label: string;
  href: string;
  logoSrc: string;
  logoClassName?: string;
  sponsored?: boolean;
};

export const PARTNERS: Partner[] = [
  {
    id: "namecheap",
    name: "Namecheap",
    label: "Namecheap",
    href: "https://namecheap.pxf.io/c/7556246/1632743/5618",
    logoSrc: "/partners/namecheap.svg",
    sponsored: true,
  },
  {
    id: "spaceship",
    name: "Spaceship",
    label: "Spaceship",
    href: "https://spaceship.sjv.io/c/7556246/1794549/21274",
    logoSrc: "/partners/spaceship.svg",
    sponsored: true,
  },
  {
    id: "ssls",
    name: "SSLs.com",
    label: "SSLs.com",
    href: "https://ssls.sjv.io/c/7556246/971595/9312",
    logoSrc: "/partners/ssls.svg",
    sponsored: true,
  },
  {
    id: "ieee-cs",
    name: "IEEE Computer Society",
    label: "Computer Society",
    href: "https://www.computer.org/",
    logoSrc: "/partners/ieee-computer-society.svg",
    logoClassName: "brightness-0 invert opacity-90",
    sponsored: false,
  },
];
