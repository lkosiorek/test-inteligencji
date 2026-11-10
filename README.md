# Test inteligencji

Bezpłatna aplikacja po polsku, bez zależności, konta i serwera aplikacyjnego.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Możesz też uruchomić serwer statyczny w katalogu projektu:

```sh
python3 -m http.server 8000
```

Następnie otwórz http://localhost:8000. Dla przewidywalnego przechowywania danych zalecany jest serwer lokalny: obsługa localStorage dla adresów `file:` zależy od przeglądarki.

## Zasady

- Pula 50 autorskich pytań, pięć kategorii po 10 pytań.
- Losowanie po cztery pytania z każdej kategorii, bez powtórzeń w próbie.
- Za poprawną odpowiedź 1 punkt, maksymalnie 20 punktów.
- Progi opisowe: 0–8, 9–12, 13–16, 17–20 punktów. Nie są normami psychometrycznymi ani skalą IQ.
- Zapis każdej odpowiedzi i aktualnego pytania w localStorage (`tok-myslenia-v1`). Wznowienie ze strony startowej.
- Czas rzeczywisty od rozpoczęcia do potwierdzenia zakończenia, łącznie z przerwami.
- Historia ostatnich 20 wyników wraz z odpowiedziami i wyjaśnieniami.
- Usunięcie danych witryny w przeglądarce usuwa historię i postęp. Różne adresy, porty i przeglądarki mają osobne dane.
- Przy niedostępnym zapisie aplikacja wyświetla komunikat i działa w pamięci bieżącej karty.

Test nie jest standaryzowanym badaniem inteligencji. Pytania i wyjaśnienia są dostępne w kodzie klienta; aplikacja służy samodzielnym ćwiczeniom.

## Sprawdzenie

```sh
node --check app.js
node --check questions.js
node --test tests/*.test.cjs
```

## Wzorce graficzne i zakończenie próby

Pula 50 zadań zawiera sześć pytań graficznych: kolory, liczba kropek, obrót strzałki, figury, przesuwanie pola i pary kolorów. Każda nowa próba ma co najmniej dwa zadania graficzne oraz nadal po cztery zadania z każdej kategorii. Figury i odpowiedzi są rysowane w SVG, z opisami po polsku. Pytania i klucze zapisanych wcześniej prób pozostają w pierwotnej wersji.

Wysłanie jest niedostępne do czasu udzielenia wszystkich 20 odpowiedzi. Przycisk „Pokaż nieuzupełnione pytania” wskazuje braki i przenosi do pierwszego z nich. Rezygnacja wymaga osobnego potwierdzenia, usuwa bieżącą próbę i nie tworzy wyniku; dotychczasowa historia pozostaje.
