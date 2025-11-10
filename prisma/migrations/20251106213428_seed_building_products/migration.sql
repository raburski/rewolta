-- Seed initial data (set status to ACTIVE for initial products)
INSERT INTO "BuildingProduct" ("id", "name", "imageUrl", "description", "cdnUrl", "status", "createdAt", "updatedAt")
VALUES 
    ('museum', 'Rozbudowa Muzeum Architektury', 'https://imgen-proxy.b-cdn.net/references/museum-small.png', 'Generuj unikalne budynki inspirowane Muzeum Architektury we Wrocławiu', 'https://imgen-proxy.b-cdn.net/references/museum-small.png', 'ACTIVE'::"BuildingProductStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('muzeum-ksiazat-lubomirskich', 'Muzeum Książąt Lubomirskich', 'https://imgen-proxy.b-cdn.net/references/muzeum-ksiazat-lubomirskich1.jpg', 'Podmień planowany budynek muzeum na coś bardziej w twoim stylu', 'https://imgen-proxy.b-cdn.net/references/muzeum-ksiazat-lubomirskich1.jpg', 'ACTIVE'::"BuildingProductStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

