export const strings = {
  tabs: {
    home: 'Dom',
    machdog: 'MachDog',
    pawpanel: 'Zdrowie',
    pawmap: 'Mapa',
    profile: 'Profil',
  },
  auth: {
    loginTitle: 'Witaj z powrotem',
    loginSubtitle: 'Zaloguj się do swojego konta',
    registerTitle: 'Dołącz do PawFlow',
    registerSubtitle: 'Stwórz konto i znajdź przyjaciół dla swojego psa',
    email: 'Adres e-mail',
    password: 'Hasło',
    passwordConfirm: 'Potwierdź hasło',
    loginCta: 'Zaloguj się',
    registerCta: 'Utwórz konto',
    forgotPassword: 'Zapomniałeś hasła?',
    noAccount: 'Nie masz konta?',
    hasAccount: 'Masz już konto?',
    acceptTerms: 'Akceptuję regulamin',
    acceptPrivacy: 'Akceptuję politykę prywatności',
  },
  home: {
    hero: 'Znajdź soulmate\'a\ndla swojego psa',
    heroSub: 'Dopasowania, zdrowie, mapa usług.\nWszystko w jednym miejscu.',
    cta: 'Zacznij dopasowanie',
    tagline: 'MIŁOŚĆ NA CZTERECH ŁAPACH',
  },
  errors: {
    generic: 'Coś poszło nie tak. Spróbuj ponownie.',
    network: 'Brak połączenia z internetem.',
    invalidEmail: 'Podaj prawidłowy adres e-mail.',
    passwordTooShort: 'Hasło musi mieć minimum 12 znaków.',
    passwordMismatch: 'Hasła muszą być identyczne.',
    invalidCredentials: 'Nieprawidłowy e-mail lub hasło.',
  },
} as const;

export type Strings = typeof strings;
