# **Industry Management System (IMS)**

## **Syfte**

Målet med denna gruppuppgift är att designa och implementera två API\:er som interagerar med en MongoDB-databas. Det ena API\:et ska vara ett RESTful API, och det andra ska byggas med GraphQL.

Båda API\:erna ska hantera ett Industry Management System (IMS) där användare kan utföra CRUD-operationer (Create, Read, Update, Delete) på produkter, tillverkare och deras kontakter. Datan ska modelleras med hjälp av nästlade dokument i MongoDB.

API\:erna kommer i princip att göra samma sak, men syftet är att ni ska få en förståelse för skillnaderna mellan dem.

Kravspecifikationen kan fritt byggas ut med egna idéer.

---

## **Verktyg och teknologier**

- **Backendramverk:** Node.js, Express
- **Databas:** MongoDB
- **ODM:** Mongoose
- **API-teknologier:** RESTful API, GraphQL

---

## **Uppgift 1: RESTful API**

### **Krav**

1. **Sätt upp ett RESTful API**

   - Skapa en `Express`-server.
   - Koppla upp mot en `MongoDB`-databas med hjälp av `Mongoose`.
   - Definiera en `Product`-modell med nästlade dokument och följande fält:

     - **Product**

       - name
       - sku
       - description
       - price
       - category
       - manufacturer
       - amountInStock

     - **Manufacturer**

       - name
       - country
       - website
       - description
       - address
       - contact

     - **Contact**

       - name
       - email
       - phone

2. **Implementera följande RESTful-routes**

   - `GET /api/products` – Hämta en lista över alla produkter, inklusive "manufacturer" och "contact".
   - `GET /api/products/:id` – Hämta detaljer för en enskild produkt via ID, inklusive "manufacturer" och "contact".
   - `POST /api/products` – Skapa en ny produkt.
   - `PUT /api/products/:id` – Uppdatera en produkt via ID.
   - `DELETE /api/products/:id` – Ta bort en produkt via ID.

3. **Ytterligare endpoints**

   - **Summera det totala värdet av alla produkter i lager**

     - `GET /api/products/total-stock-value`

   - **Summera det totala värdet av produkter i lager per tillverkare**

     - `GET /api/products/total-stock-value-by-manufacturer`

   - **Hämta en lista över alla produkter med färre än 10 enheter i lager**

     - `GET /api/products/low-stock`

   - **Hämta en kompakt lista över produkter med färre än 5 enheter i lager (inkluderar endast tillverkarens/manufacturer samt kontaktens/contact namn, telefon och e-post)**

     - `GET /api/products/critical-stock`

   - **Hämta en lista över alla tillverkare företaget samarbetar med**

     - `GET /api/manufacturers`

---

## **Uppgift 2: GraphQL API**

### **Krav**

1. **Sätt upp GraphQL API**

   - Skapa en ny `Express`-serverinstans eller använd den befintliga.
   - Integrera `GraphQL` med `Express` via `ApolloServer` eller använd `ApolloServer` som standalone.
   - Anslut till samma `MongoDB`-databas med hjälp av `Mongoose`.

2. **Definiera GraphQL-schema**

   - Definiera GraphQL-typer enligt samma modell som i Uppgift 1.
   - Definiera följande query-/mutation-funktioner (samma som i Uppgift 1):

     - `products`: Hämta en lista över alla produkter.
     - `product(id: ID!)`: Hämta detaljer för en enskild produkt via ID.
     - `totalStockValue`: Hämta det totala värdet av alla produkter i lager.
     - `totalStockValueByManufacturer`: Hämta det totala värdet av produkter i lager, grupperat per tillverkare.
     - `lowStockProducts`: Hämta en lista över produkter med färre än 10 enheter i lager.
     - `criticalStockProducts`: Hämta en lista över produkter med färre än 5 enheter i lager, inklusive tillverkarens namn, kontaktens namn, telefonnummer och e-post.
     - `manufacturers`: Hämta en lista över alla tillverkare företaget samarbetar med.
     - `addProduct`: Skapa en ny produkt.
     - `updateProduct`: Uppdatera en befintlig produkt via ID.
     - `deleteProduct`: Ta bort en produkt via ID.

   - Lägg till ett exempel på query/mutation för varje funktion i filen `queries-and-mutations.md` i projektets rotmapp.

3. **Resolvers**

   - Implementera resolvers för att hantera queries och mutationer, och se till att nästlade dokument (tillverkare och kontakt) hanteras korrekt.
   - Implementera logiken för de specifika queries som rör lagervärde, produkter med lågt lager, kritiska lagerprodukter och tillverkare.

4. **Testa API\:et med Apollo Sandbox**

   - Använd Apollo Sandbox för att testa queries och mutationer.

---

## **Bonus (ej obligatoriskt)**

- **Generera testdata**

  - Skapa slumpmässig testdata (mer än 1000 dokument) för att fylla databasen.

- **Skapa en frontend**

  - Bygg en frontend som använder API\:ets routes/queries.

- **Paginering och filtrering**

  - Implementera paginering i `products`-query i GraphQL API.
  - Implementera filtrering på `category`, `manufacturer` (namn) och `amountInStock` i båda API\:erna.

- **Validering och felhantering**

  - Lägg till validering för obligatoriska fält och säkerställ att nästlade dokument hanteras korrekt.
  - Implementera felhantering för t.ex. "not found"-fel, valideringsfel m.m.

- **Avancerad felhantering**

  - Implementera mer sofistikerad felhantering i GraphQL API genom att utnyttja GraphQL\:s inbyggda mekanismer.

- **Andra idéer**

  - Kravspecifikationen kan fritt byggas ut med egna idéer.

---

## **Inlämning**

- Lämna in gruppens kod som ett GitHub-repository.
- Sista inlämningsdag: **torsdag 25 september**.
- Den 25 september kommer varje grupp även att hålla en kort live-presentation (max 10 minuter).

---

## **Kursmål**

- Endast godkänt (VG ges ej).
- Grundläggande färdigheter och kunskaper i Express, REST-API, MongoDB, Mongoose och GraphQL.
