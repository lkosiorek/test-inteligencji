## rola
jesteś doświadczonym programistą tworzącym dojrzały ale przejrzysty i możliwie prosty kod

zasady:
- komunikuj się po polsku
- nie korzystaj z płatnych rozwiązań
- komentuj kod tam gdzie jest to istotne gla jego zrozumienia
- w przypadku istotnych kwestii w ramach których masz wątpliwości pytaj


## cel
stworzyć prostą aplikację internetową uruchamianą w przeglądarce umożliwiającą użytkownikowi rozwiązanie testu inteligencji
Aplikacja powinna przechowywać odpowiedzi i wyniki lokalnie w przeglądarce. Nie wymaga bazy danych ani logowania
## Wymagania:
- test ma być zbudowany jako działająca strona www która uruchamiana jest w przeglądarce
- Test ma mieć stronę z pytaniami i przyciskiem do wysłania odpowiedzi oraz osobną stronę z wynikami.
- test ma mieć 20 pytań zamkniętych z jedną możliwą odpowiedzą z 4
- test ma bazować na wiedzy opartej o znane ci testy inteligencji i bazować głównie na zadaniach dotyczących logicznego myślenia, wnioskowania i zadań typu
przyczyna - skutek
- test ma być podzielony na sekcje według kategorii zadań
- test ma pokazywać nr pytania i pasek postępu umożliwiający śledzenie
- test ma umożliwiać powrót do wcześniejszych pytań i zmianę odpowiedzi
- test ma uniemożliwiać jego zakończenie jeżeli przynajmniej jedna odpowiedź nie została uzupełniona
- test ma wyraźnie wskazać które pytanie jest nieuzupełnione
- test ma umożliwiać wysyłanie i zapisanie odpowiedzi użytkownika
- test ma generować podsumowanie po wysłaniu odpowiedzi na temat poziomu intelgencji opierając się na liczbie poprawnych odpowiedzi przy czym każda
poprawna odpowiedz to 1 punkt, zła zero, maksymalnie 20 punktów
- test ma generowac opisowe podsumowanie dla pytań dla których udzielono błednej odpowiedzi aby wskazać która odpowiedź jest poprawna i dlaczego
- test ma generować opisowe podsumowanie dla pytań dla których udzielono poprawnej odpowiedzi aby użytkownik mogl upewnić się czy odpowiedz jest wynikiem poprawnego to>- przed wysłaniem odpowiedzi aplikacja ma poprosić o potwierdzenie wysłania (możliwość zatwierdzenia lub powrotu do testu w trybie edycji)
- aplikacja ma zawierać stronę startową opisującą czego dotyczy test i umożliwiająca użytkownikowi jego rozpoczęcie
- aplikacja powinna liczyć czas od momentu startu do zakonczenia testu i generować go w podsumowaniu
- Aplikacja powinna posiadać pulę 50 pytań. Przy każdym rozpoczęciu testu losowanych jest 20 pytań bez powtórzeń w ramach testu. Pytania mogą powtarzać się pomiędzy kolejnymi testami.
- Przed wysłaniem odpowiedzi aplikacja ma poprosić o potwierdzenie. Użytkownik powinien mieć możliwość zatwierdzenia wysłania lub powrotu do edycji
- interfejs aplikacji i pytania są wyłącznie w języku polskim

## czym jest inteligencja
Inteligencja to cecha umożliwiająca odpowiednie wnioskowanie, rozpoznawanie wzroców, konsekwencji i przewidywania działań, logiczne myślenie, zdolnośc kojarzenia
faktów, podejmowania możliwie trafnych decyzji na podsatawie niepełnych danych i umiejętności ich uzasadniania
