
// Comprehensive translation system for the application
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'sv' | 'ar';

export interface Translations {
  // Navigation & General
  dashboard: string;
  calendar: string;
  tasks: string;
  reports: string;
  settings: string;
  logout: string;
  login: string;
  register: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  create: string;
  update: string;
  submit: string;
  approve: string;
  reject: string;
  pending: string;
  active: string;
  inactive: string;
  
  // User Management
  users: string;
  employees: string;
  managers: string;
  departments: string;
  organizations: string;
  addEmployee: string;
  promoteToManager: string;
  createDepartment: string;
  
  // Schedule & Time
  schedule: string;
  timeLog: string;
  clockIn: string;
  clockOut: string;
  morning: string;
  afternoon: string;
  night: string;
  today: string;
  tomorrow: string;
  thisWeek: string;
  
  // Sick Notice
  sickNotice: string;
  submitSickNotice: string;
  sickReason: string;
  startDate: string;
  endDate: string;
  
  // QR Code
  qrCode: string;
  scanQR: string;
  qrTimeLogging: string;
  
  // Organizations
  organizationManagement: string;
  totalEmployees: string;
  activeToday: string;
  onTimePerformance: string;
  
  // Status messages
  success: string;
  error: string;
  loading: string;
  noData: string;
  
  // Branding
  appName: string;
  tagline: string;
}

const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // Navigation & General
    dashboard: "Dashboard",
    calendar: "Calendar",
    tasks: "Tasks",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    update: "Update",
    submit: "Submit",
    approve: "Approve",
    reject: "Reject",
    pending: "Pending",
    active: "Active",
    inactive: "Inactive",
    
    // User Management
    users: "Users",
    employees: "Employees",
    managers: "Managers",
    departments: "Departments",
    organizations: "Organizations",
    addEmployee: "Add Employee",
    promoteToManager: "Promote to Manager",
    createDepartment: "Create Department",
    
    // Schedule & Time
    schedule: "Schedule",
    timeLog: "Time Log",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    morning: "Morning",
    afternoon: "Afternoon",
    night: "Night",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    
    // Sick Notice
    sickNotice: "Sick Notice",
    submitSickNotice: "Submit Sick Notice",
    sickReason: "Reason for Absence",
    startDate: "Start Date",
    endDate: "End Date",
    
    // QR Code
    qrCode: "QR Code",
    scanQR: "Scan QR",
    qrTimeLogging: "QR Time Logging",
    
    // Organizations
    organizationManagement: "Organization Management",
    totalEmployees: "Total Employees",
    activeToday: "Active Today",
    onTimePerformance: "On-Time Performance",
    
    // Status messages
    success: "Success",
    error: "Error",
    loading: "Loading",
    noData: "No Data Available",
    
    // Branding
    appName: "MinTid",
    tagline: "Work Schedule Management"
  },
  
  es: {
    // Navigation & General
    dashboard: "Tablero",
    calendar: "Calendario",
    tasks: "Tareas",
    reports: "Reportes",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    login: "Iniciar Sesión",
    register: "Registrarse",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    create: "Crear",
    update: "Actualizar",
    submit: "Enviar",
    approve: "Aprobar",
    reject: "Rechazar",
    pending: "Pendiente",
    active: "Activo",
    inactive: "Inactivo",
    
    // User Management
    users: "Usuarios",
    employees: "Empleados",
    managers: "Gerentes",
    departments: "Departamentos",
    organizations: "Organizaciones",
    addEmployee: "Añadir Empleado",
    promoteToManager: "Promover a Gerente",
    createDepartment: "Crear Departamento",
    
    // Schedule & Time
    schedule: "Horario",
    timeLog: "Registro de Tiempo",
    clockIn: "Marcar Entrada",
    clockOut: "Marcar Salida",
    morning: "Mañana",
    afternoon: "Tarde",
    night: "Noche",
    today: "Hoy",
    tomorrow: "Mañana",
    thisWeek: "Esta Semana",
    
    // Sick Notice
    sickNotice: "Aviso de Enfermedad",
    submitSickNotice: "Enviar Aviso de Enfermedad",
    sickReason: "Motivo de Ausencia",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Fin",
    
    // QR Code
    qrCode: "Código QR",
    scanQR: "Escanear QR",
    qrTimeLogging: "Registro de Tiempo con QR",
    
    // Organizations
    organizationManagement: "Gestión de Organización",
    totalEmployees: "Total de Empleados",
    activeToday: "Activos Hoy",
    onTimePerformance: "Rendimiento Puntual",
    
    // Status messages
    success: "Éxito",
    error: "Error",
    loading: "Cargando",
    noData: "No Hay Datos Disponibles",
    
    // Branding
    appName: "MinTid",
    tagline: "Gestión de Horarios de Trabajo"
  },
  
  fr: {
    // Navigation & General
    dashboard: "Tableau de Bord",
    calendar: "Calendrier",
    tasks: "Tâches",
    reports: "Rapports",
    settings: "Paramètres",
    logout: "Déconnexion",
    login: "Connexion",
    register: "S'inscrire",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    create: "Créer",
    update: "Mettre à jour",
    submit: "Soumettre",
    approve: "Approuver",
    reject: "Rejeter",
    pending: "En attente",
    active: "Actif",
    inactive: "Inactif",
    
    // User Management
    users: "Utilisateurs",
    employees: "Employés",
    managers: "Gestionnaires",
    departments: "Départements",
    organizations: "Organisations",
    addEmployee: "Ajouter un Employé",
    promoteToManager: "Promouvoir au Poste de Gestionnaire",
    createDepartment: "Créer un Département",
    
    // Schedule & Time
    schedule: "Horaire",
    timeLog: "Journal de Temps",
    clockIn: "Pointer à l'Arrivée",
    clockOut: "Pointer au Départ",
    morning: "Matin",
    afternoon: "Après-midi",
    night: "Nuit",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    thisWeek: "Cette Semaine",
    
    // Sick Notice
    sickNotice: "Avis de Maladie",
    submitSickNotice: "Soumettre un Avis de Maladie",
    sickReason: "Raison de l'Absence",
    startDate: "Date de Début",
    endDate: "Date de Fin",
    
    // QR Code
    qrCode: "Code QR",
    scanQR: "Scanner QR",
    qrTimeLogging: "Enregistrement du Temps par QR",
    
    // Organizations
    organizationManagement: "Gestion d'Organisation",
    totalEmployees: "Total des Employés",
    activeToday: "Actifs Aujourd'hui",
    onTimePerformance: "Performance Ponctuelle",
    
    // Status messages
    success: "Succès",
    error: "Erreur",
    loading: "Chargement",
    noData: "Aucune Donnée Disponible",
    
    // Branding
    appName: "MinTid",
    tagline: "Gestion des Horaires de Travail"
  },
  
  de: {
    // Navigation & General
    dashboard: "Dashboard",
    calendar: "Kalender",
    tasks: "Aufgaben",
    reports: "Berichte",
    settings: "Einstellungen",
    logout: "Abmelden",
    login: "Anmelden",
    register: "Registrieren",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    create: "Erstellen",
    update: "Aktualisieren",
    submit: "Senden",
    approve: "Genehmigen",
    reject: "Ablehnen",
    pending: "Ausstehend",
    active: "Aktiv",
    inactive: "Inaktiv",
    
    // User Management
    users: "Benutzer",
    employees: "Mitarbeiter",
    managers: "Manager",
    departments: "Abteilungen",
    organizations: "Organisationen",
    addEmployee: "Mitarbeiter Hinzufügen",
    promoteToManager: "Zum Manager Befördern",
    createDepartment: "Abteilung Erstellen",
    
    // Schedule & Time
    schedule: "Zeitplan",
    timeLog: "Zeitprotokoll",
    clockIn: "Einstempeln",
    clockOut: "Ausstempeln",
    morning: "Morgen",
    afternoon: "Nachmittag",
    night: "Nacht",
    today: "Heute",
    tomorrow: "Morgen",
    thisWeek: "Diese Woche",
    
    // Sick Notice
    sickNotice: "Krankmeldung",
    submitSickNotice: "Krankmeldung Einreichen",
    sickReason: "Grund für Abwesenheit",
    startDate: "Startdatum",
    endDate: "Enddatum",
    
    // QR Code
    qrCode: "QR-Code",
    scanQR: "QR Scannen",
    qrTimeLogging: "QR-Zeiterfassung",
    
    // Organizations
    organizationManagement: "Organisationsverwaltung",
    totalEmployees: "Gesamte Mitarbeiter",
    activeToday: "Heute Aktiv",
    onTimePerformance: "Pünktlichkeitsleistung",
    
    // Status messages
    success: "Erfolg",
    error: "Fehler",
    loading: "Laden",
    noData: "Keine Daten Verfügbar",
    
    // Branding
    appName: "MinTid",
    tagline: "Arbeitszeit-Management"
  },
  
  sv: {
    // Navigation & General
    dashboard: "Instrumentpanel",
    calendar: "Kalender",
    tasks: "Uppgifter",
    reports: "Rapporter",
    settings: "Inställningar",
    logout: "Logga ut",
    login: "Logga in",
    register: "Registrera",
    save: "Spara",
    cancel: "Avbryt",
    delete: "Radera",
    edit: "Redigera",
    add: "Lägg till",
    create: "Skapa",
    update: "Uppdatera",
    submit: "Skicka",
    approve: "Godkänn",
    reject: "Avvisa",
    pending: "Väntar",
    active: "Aktiv",
    inactive: "Inaktiv",
    
    // User Management
    users: "Användare",
    employees: "Anställda",
    managers: "Chefer",
    departments: "Avdelningar",
    organizations: "Organisationer",
    addEmployee: "Lägg till Anställd",
    promoteToManager: "Befordra till Chef",
    createDepartment: "Skapa Avdelning",
    
    // Schedule & Time
    schedule: "Schema",
    timeLog: "Tidslogg",
    clockIn: "Stämpla in",
    clockOut: "Stämpla ut",
    morning: "Morgon",
    afternoon: "Eftermiddag",
    night: "Natt",
    today: "Idag",
    tomorrow: "Imorgon",
    thisWeek: "Denna Vecka",
    
    // Sick Notice
    sickNotice: "Sjukanmälan",
    submitSickNotice: "Skicka Sjukanmälan",
    sickReason: "Anledning till Frånvaro",
    startDate: "Startdatum",
    endDate: "Slutdatum",
    
    // QR Code
    qrCode: "QR-kod",
    scanQR: "Skanna QR",
    qrTimeLogging: "QR-tidsloggning",
    
    // Organizations
    organizationManagement: "Organisationshantering",
    totalEmployees: "Totalt Anställda",
    activeToday: "Aktiva Idag",
    onTimePerformance: "Punktlighetsprestanda",
    
    // Status messages
    success: "Framgång",
    error: "Fel",
    loading: "Laddar",
    noData: "Inga Data Tillgängliga",
    
    // Branding
    appName: "MinTid",
    tagline: "Schemahantering för Arbete"
  },
  
  ar: {
    // Navigation & General
    dashboard: "لوحة التحكم",
    calendar: "التقويم",
    tasks: "المهام",
    reports: "التقارير",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    register: "التسجيل",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    create: "إنشاء",
    update: "تحديث",
    submit: "إرسال",
    approve: "موافقة",
    reject: "رفض",
    pending: "في الانتظار",
    active: "نشط",
    inactive: "غير نشط",
    
    // User Management
    users: "المستخدمين",
    employees: "الموظفين",
    managers: "المديرين",
    departments: "الأقسام",
    organizations: "المنظمات",
    addEmployee: "إضافة موظف",
    promoteToManager: "ترقية إلى مدير",
    createDepartment: "إنشاء قسم",
    
    // Schedule & Time
    schedule: "الجدول الزمني",
    timeLog: "سجل الوقت",
    clockIn: "تسجيل الدخول",
    clockOut: "تسجيل الخروج",
    morning: "الصباح",
    afternoon: "بعد الظهر",
    night: "الليل",
    today: "اليوم",
    tomorrow: "غداً",
    thisWeek: "هذا الأسبوع",
    
    // Sick Notice
    sickNotice: "إشعار مرضي",
    submitSickNotice: "تقديم إشعار مرضي",
    sickReason: "سبب الغياب",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    
    // QR Code
    qrCode: "رمز الاستجابة السريعة",
    scanQR: "مسح الرمز",
    qrTimeLogging: "تسجيل الوقت بالرمز",
    
    // Organizations
    organizationManagement: "إدارة المنظمة",
    totalEmployees: "إجمالي الموظفين",
    activeToday: "النشطون اليوم",
    onTimePerformance: "أداء الالتزام بالوقت",
    
    // Status messages
    success: "نجح",
    error: "خطأ",
    loading: "جاري التحميل",
    noData: "لا توجد بيانات متاحة",
    
    // Branding
    appName: "MinTid",
    tagline: "إدارة جداول العمل"
  }
};

class TranslationManager {
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Function[] = [];

  constructor() {
    const savedLanguage = localStorage.getItem('mintid_language') as SupportedLanguage;
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
    localStorage.setItem('mintid_language', language);
    this.notifyListeners();
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  translate(key: keyof Translations): string {
    return translations[this.currentLanguage][key] || translations.en[key] || key;
  }

  subscribe(callback: Function) {
    this.listeners.push(callback);
  }

  unsubscribe(callback: Function) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  getLanguageName(language: SupportedLanguage): string {
    const names = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      sv: 'Svenska',
      ar: 'العربية'
    };
    return names[language];
  }
}

export const translationManager = new TranslationManager();
export default translationManager;
