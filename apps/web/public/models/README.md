# Model 3D psa

Strona szuka pliku **`chihuahua.glb`** w tym katalogu. Dopóki go nie ma, sekcja z psem
nie jest renderowana i `three.js` nie jest pobierany.

## Wymagania dla modelu

- Format: **glTF Binary (.glb)**, układ współrzędnych glTF (Y w górę).
- Pies zwrócony przodem w stronę **+X** (biegnie w prawo). Jeśli eksport jest obrócony, popraw `MODEL_YAW` w `DogScene.tsx`.
- Skala i początek układu dowolne, model jest normalizowany (stopy na ziemi, wysokość 1 jednostka).
- **Animacja biegu** w pętli. Klip o nazwie zawierającej `run`, `gallop` lub `bieg`, w przeciwnym razie pierwszy klip.
- Kompresja: najlepiej **meshopt** (`gltfpack -cc`). Draco nie jest obsługiwane.
- Tekstury: PBR (baseColor, normal, roughness) w 1k–2k, najlepiej wbudowane. Docelowo plik poniżej ~5 MB.
- Futro: kosmyki jako karty alfa lub shell fur z materiałem `alphaMode: MASK`/`BLEND`; oświetlenie sceny to ciepłe światło studyjne (patrz `DogScene.tsx`).
