# PawFlo — Wizja produktu v2: wirtualny świat psiego kolegi

> Status: **PROPOZYCJA do akceptacji** (listopad 2026). Zastępuje koncepcję "Tinder dla psów".
> Po akceptacji: zsynchronizować z `CLAUDE.md` i `PAWFLO_INSTRUKCJA_AGENTA_VSC.md` (sekcja 1 i 5).

---

## 1. Idea w jednym zdaniu

**PawFlo to cyfrowy dom Twojego pupila**: jedno miejsce, w którym żyje całe jego kompendium wiedzy, wspomnienia, postępy i ulubione ścieżki spacerowe.

Nie szukamy psu partnera do swipe'owania. Pomagamy opiekunowi **znać, pamiętać i lepiej opiekować się** swoim psem, a przy okazji mieć wokół siebie społeczność, która dzieli się sprawdzoną wiedzą.

### Co się zmienia

| Było (v1) | Jest (v2) |
|---|---|
| Aplikacja do poznawania innych psów | Aplikacja o **moim** psie |
| Swipe + dopasowania jako rdzeń | Pamiętnik + panel pupila jako rdzeń |
| Czat 1:1 po dopasowaniu | Czat **community** (kanały tematyczne) |
| Mapa usług (wet, sklep, groomer) | Mapa **spacerów** (ulubione spoty) + usługi jako warstwa |
| Wartość: znajomości | Wartość: wiedza, pamięć, spokój o zdrowie |

### Narracja marki

- **Strona** (apps/web) opowiada historię: *"Twój pies ma całe życie. Zadbaj, żeby nic z niego nie zginęło."*
- **Aplikacja** (apps/mobile) jest miejscem, gdzie ta historia się dzieje codziennie.
- Ton: ciepły, osobisty, edytorski (Fraunces + coral/cream). Mniej "gry", więcej "rodzinnego albumu".

---

## 2. Filary produktu

### 2.1 PawPanel — panel pupila (kompendium)
Wszystko, co trzeba wiedzieć i mieć pod ręką (u weterynarza, w podróży, przy zmianie opiekuna).

- Profil: rasa, chip, data urodzenia, umaszczenie, ubezpieczenie, kontakty (wet, hotel, trener)
- Zdrowie: szczepienia (z przypomnieniami), badania, wizyty, leki, alergie, waga (wykres)
- **Nowe:** tresura (komendy, etapy, trener), aktywności (sporty, kursy, certyfikaty), dokumenty (skany książeczki, wyniki)
- Eksport PDF "karta pupila" dla weterynarza lub hotelu

### 2.2 Pamiętnik pupila (filar emocjonalny)
Narracyjny zapis życia psa: pierwszy dzień w domu, pierwsze morze, trudny okres, urodziny.

- Wpisy z datą, nastrojem, zdjęciami, tagami
- Oś czasu ("rok temu w ten dzień")
- Prywatny, szyfrowany (AES-256-GCM treść wpisu)
- Różnica wobec dzienniczka: pamiętnik to **opowieść**, dzienniczek to **dane robocze**

### 2.3 Album pupila
Wirtualny album z możliwością edycji okładek.

- Albumy tematyczne ("Szczeniak", "Wakacje 2026", "Góry")
- **Edytowalne okładki**: wybór zdjęcia, kadrowanie, tytuł (Fraunces), kolor tła z palety Soulmate, szablony
- Zdjęcia z podpisami i datą; z pamiętnika można dodać zdjęcie do albumu
- Prywatny domyślnie; udostępnianie linkiem opcjonalnie (Faza 2)

### 2.4 Dzienniczek
Szybkie notatki o postępach i uwagach: "dziś pierwszy raz zostało samo 30 min", "kuleje na lewą łapę", "nowa karma, brak reakcji".

- Szybkie dodawanie (jedno pole, kategoria, opcjonalnie zdjęcie)
- Kategorie: zachowanie, trening, zdrowie, jedzenie, inne
- Filtrowanie i wyszukiwanie; możliwość "przypięcia" wpisu do wizyty u weterynarza
- Notatki zdrowotne szyfrowane tak jak dziś notatki medyczne

### 2.5 PawMap — mapa spacerów
Zapisywanie i szukanie ulubionych miejsc na spacer.

- Własne spoty: pinezka, nazwa, zdjęcia, tagi (las, woda, wybieg, cień, dużo psów, bez smyczy), ocena, notatka
- Zapis trasy spaceru (GPS, dystans, czas) i podpięcie do dzienniczka
- Mapa współdzielona z community (Faza 2, **tylko opt-in**, bez publikowania lokalizacji domu)
- Usługi (wet, sklep, groomer) zostają jako druga warstwa mapy
- Prywatność: spoty blisko adresu domowego nie są nigdy publikowane automatycznie

### 2.6 Poradniki (biblioteka wiedzy)
Rzeczy "ciężkie do zdobycia dla zwykłego Kowalskiego": jak czytać skład karmy, prawa w transporcie, co zrobić po ukąszeniu kleszcza, ubezpieczenia, pierwsza pomoc, zakaz wejścia z psem, procedury adopcji.

- **Własna redakcja w MDX** (decyzja produktowa): pełna kontrola jakości i praw autorskich
- Kategorie, wyszukiwarka, zapisywanie do ulubionych, tryb offline w aplikacji
- Każdy poradnik: data weryfikacji, autor/źródło, zastrzeżenie "to nie zastępuje wizyty u weterynarza"
- Ten sam content zasila SEO na stronie (blog) i aplikację

### 2.7 Community (czat społeczności)
Zostaje istniejąca infrastruktura Socket.io, ale zmienia się model.

- Zamiast czatu 1:1 po dopasowaniu: **kanały tematyczne** (zdrowie, tresura, rasy, miasta, adopcje, spacery)
- Wymiana sprawdzonych informacji, pytania do społeczności
- Wymaga moderacji: zgłaszanie, blokowanie, regulamin, rate limit (to **nowa powierzchnia ataku**, patrz SECURITY.md)
- Kanały na MVP v2: małe i kuratorowane, z wyraźną rolą moderatora

---

## 3. Szkic modelu danych (propozycja)

Zachowujemy istniejące modele zdrowotne (`Dog`, `Photo`, `WeightEntry`, `Vaccination`, `VetVisit`, `Medication`, `Allergy`) oraz `User`, `RefreshToken`, `AuditLog`, `Place`, `Waitlist`.

**Nowe modele:**

| Model | Najważniejsze pola | Wrażliwość |
|---|---|---|
| `DiaryEntry` | dogId, date, title, bodyEnc, mood, tags[] | treść szyfrowana AES-256-GCM |
| `Album` | dogId, title, coverPhotoId, coverStyle (JSON), sortOrder | prywatne |
| `AlbumPhoto` | albumId, photoId, caption, takenAt, position | prywatne |
| `LogEntry` (dzienniczek) | dogId, category, textEnc, createdAt | szyfrowane dla kategorii zdrowie |
| `WalkSpot` | userId, dogId?, name, lat, lng, tags[], rating, noteEnc | współrzędne i notatka prywatne |
| `WalkTrack` | dogId, startedAt, distanceM, durationS, polyline | prywatne |
| `TrainingItem` | dogId, skill, status, startedAt, notesEnc | prywatne |
| `ExamResult` | dogId, type, date, fileId?, notesEnc | medyczne, szyfrowane |
| `SavedGuide` | userId, guideSlug | niewrażliwe |
| `Channel` / `ChannelMessage` | name, slug, moderated / body, authorId | publiczne w obrębie community |

Poradniki **nie trafiają do bazy**: żyją jako MDX (jak blog), baza trzyma tylko `SavedGuide`.

Każdy nowy endpoint wymaga: autoryzacji właściciela psa, walidacji Zod z `@pawflo/validation`, wpisu do `AuditLog` dla operacji wrażliwych.

---

## 4. Wpływ na istniejący kod

### Do usunięcia (MachDog)
- API: `routes/swipes.ts`, `routes/matches.ts`, powiązane testy; modele `Swipe`, `Match`, enumy `SwipeDirection`, `MatchStatus`
- Prisma: skrypty `bot-like-me.ts`, `reset-swipes.ts`; migracja usuwająca tabele
- Mobile: `(tabs)/machdog.tsx`, `(tabs)/matches.tsx`, `useMachDog` (+ test), `SwipeCard`
- Packages: `validation/machdog.ts` (+ test), `types/Match.ts`, wpisy w `api-client`
- Web: copy w `HeroSection`, `HowItWorksSection`, `PillarsSection`, `UspSection`, `TestimonialsSection`, `PricingSection`, `B2bSection`; artykuł o znajdowaniu przyjaciela dla psa w Warszawie
- Docs i master instrukcja: wszystkie odniesienia do MachDog

### Do przerobienia
- `Message` i `routes/chat.ts` (z `matchId` na `channelId`), ekran `chat/[matchId].tsx` na kanały
- `pawmap.tsx`: z mapy usług na mapę spacerów (+ warstwa usług)
- `pawpanel.tsx`: rozszerzenie o tresurę, badania, dokumenty
- Dock: 5 zakładek zmienia się z (Dom, MachDog, PawPanel, PawMap, Profil) na np. (Dom, Panel, Pamiętnik, Mapa, Poradniki) z Community wchodzącą z Domu lub Profilu
- Onboarding: ujęcie "poznaj swojego psa" zamiast "cechy do dopasowania" (`step-3-traits`)
- `strings.pl.ts`: nowe copy

### Do dodania
Wszystko z sekcji 3 oraz ekrany: Pamiętnik, Albumy (z edytorem okładek), Dzienniczek, Spoty, Biblioteka poradników, Kanały.

---

## 5. Plan fazowy (propozycja)

| Faza | Zakres | Cel |
|---|---|---|
| **0 — Pivot** (teraz) | Dokumentacja, nazwy, decyzje. Usunięcie MachDog (osobny commit). | Czysta baza |
| **1 — Rdzeń** | PawPanel rozszerzony, Dzienniczek, Pamiętnik, Mapa spacerów (własne spoty) | Użytkownik codziennie wraca |
| **2 — Pamięć** | Albumy z edytorem okładek, eksport PDF karty pupila, zapisane poradniki offline | Silny efekt "to jest moje" |
| **3 — Wiedza** | Biblioteka poradników w aplikacji (MDX), wyszukiwarka | Powód do otwarcia aplikacji bez wpisu |
| **4 — Społeczność** | Kanały community z moderacją, opcjonalne współdzielenie spotów | Efekt sieciowy |
| **5 — Rodzina** | Wielu opiekunów jednego pupila, udostępnianie albumu | Retencja |

Kolejność uzasadnienie: najpierw wartość **jednoosobowa** (działa od pierwszego użytkownika), na końcu elementy sieciowe, które wymagają masy krytycznej i moderacji.

---

## 6. Ryzyka i decyzje do podjęcia

1. **Cena zmiany** — wiele ekranów i copy do przepisania; ukryte tabele w produkcji wymagają migracji (czy są realni użytkownicy z dopasowaniami?).
2. **Szyfrowanie vs wyszukiwanie** — zaszyfrowane treści pamiętnika nie da się przeszukać po stronie bazy. Wyszukiwanie po stronie klienta albo tylko po tagach/datach.
3. **Moderacja community** — od pierwszego dnia potrzebny regulamin, zgłaszanie treści, blokowanie, i ktoś, kto to czyta.
4. **Treści poradników** — zdrowie zwierząt to obszar odpowiedzialności; potrzebna weryfikacja merytoryczna (konsultant weterynaryjny?) i disclaimery.
5. **RODO** — pamiętnik i lokalizacje to nowe kategorie danych: aktualizacja polityki prywatności, eksportu JSON i usuwania (30 dni) o nowe modele.
6. **Monetyzacja** — dotychczasowy plan cenowy (`PricingSection`) zakładał MachDog; do przemyślenia (np. Plus: nielimitowane albumy, eksport PDF, współdzielenie z rodziną).
7. **Nazwa modułów** — czy "PawPanel / PawMap" zostają, a pamiętnik dostaje własne imię (np. *PawDiary*, *Pamiętnik*)?

---

*Dokument roboczy. Zmiany kierunku zapisujemy tutaj, zanim trafią do kodu.*
