import { Home, FileText, ClipboardList, Lightbulb, Users2, History, BarChart3, CalendarRange, Weight, Users, BookOpen, ScrollText } from "lucide-react";

export const GROUP_LABELS = {
  main:    "Navigation",
  gestion: "Gestion",
  admin:   "Administration",
};

export const GROUP_ORDER = ["main", "gestion", "admin"];

export const NAV_ITEMS = [
  // PROFESSEUR
  { icon: Home,          label: "Accueil",          href: "/dashboard/professeur",              roles: ["PROFESSEUR"], group: "main"    },
  { icon: FileText,      label: "Mon CV",             href: "/dashboard/professeur/cv",           roles: ["PROFESSEUR"], group: "main"    },
  { icon: ClipboardList, label: "Mes Affectations",  href: "/dashboard/professeur/affectations", roles: ["PROFESSEUR"], group: "main"    },
  { icon: Lightbulb,     label: "Compétences",   href: "/dashboard/professeur/competences",  roles: ["PROFESSEUR"], group: "main"    },
  { icon: Users2,     label: "Mon Profil",    href: "/dashboard/professeur/profil",         roles: ["PROFESSEUR"], group: "main"    },
  { icon: History,    label: "Historique CV",  href: "/dashboard/professeur/historique",    roles: ["PROFESSEUR"], group: "main"    },
  // RH
  { icon: BarChart3,     label: "Accueil",       href: "/dashboard/rh",                      roles: ["RH"],             group: "main"    },
  { icon: FileText,      label: "CVs",           href: "/dashboard/rh/cvs",                  roles: ["RH"],             group: "main"    },
  { icon: ClipboardList, label: "Affectations",  href: "/dashboard/rh/affectations",         roles: ["RH"],             group: "main"    },
  { icon: CalendarRange, label: "Sessions",      href: "/dashboard/admin/sessions",          roles: ["RH", "ADMIN"],    group: "gestion" },
  { icon: Weight,        label: "Pondérations",  href: "/dashboard/rh/weights",              roles: ["RH"],    group: "gestion" },
  // ADMIN
  { icon: Home,          label: "Accueil",       href: "/dashboard/admin",                   roles: ["ADMIN"],          group: "main"    },
  { icon: Users,         label: "Utilisateurs",  href: "/dashboard/admin/users",             roles: ["ADMIN"],          group: "admin"   },
  { icon: BookOpen,      label: "Cours",         href: "/dashboard/admin/courses",           roles: ["ADMIN"],          group: "admin"   },
  { icon: Lightbulb,    label: "Compétences",   href: "/dashboard/admin/skills",            roles: ["ADMIN"],          group: "admin"   },
  { icon: ClipboardList, label: "Affectations",  href: "/dashboard/admin/affectations",      roles: ["ADMIN"],          group: "admin"   },
  { icon: History,       label: "Historique",    href: "/dashboard/admin/history",           roles: ["ADMIN"],          group: "admin"   },
  { icon: Weight,        label: "Pondérations",  href: "/dashboard/admin/weights",           roles: ["ADMIN"],          group: "gestion" },
  { icon: ScrollText,    label: "Logs",          href: "/dashboard/admin/logs",              roles: ["ADMIN"],          group: "admin"   },
  {icon: Users2,        label: "Programmes",    href: "/dashboard/admin/programs",          roles: ["ADMIN"],          group: "admin"   },
];

export const HOME_ROUTES = ["/dashboard/admin", "/dashboard/rh", "/dashboard/professeur"];