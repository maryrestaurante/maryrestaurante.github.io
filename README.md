# 🐣 Mary Restaurante — Catálogo Online

Site de catálogo de produtos com carrinho e envio via WhatsApp.

---

## 📁 Estrutura de Arquivos

```
mary-restaurante/
├── index.html              → Página principal
├── css/
│   └── style.css           → Estilos (design completo)
├── js/
│   ├── app.js              → Lógica principal (catálogo, modal, carrinho)
│   └── cart.js             → Módulo do carrinho (CartManager)
├── data/
│   └── products.json       → ⭐ Dados dos produtos (editar aqui!)
└── assets/
    └── images/
        ├── logo.png         → Logo do restaurante (adicionar aqui)
        ├── mini-confeiteiro.jpg
        ├── trufado.jpg
        ├── de-colher.jpg
        └── trio.jpg
```

---

## 🖼️ Adicionando a Logo

1. Copie sua logo para `assets/images/logo.png`
2. A logo já está referenciada no HTML — vai carregar automaticamente!
3. Recomendado: imagem quadrada mínima 200×200px (png transparente ou jpg)

---

## 🖼️ Adicionando Imagens dos Produtos

Coloque as fotos dos produtos na pasta `assets/images/` com os nomes:
- `mini-confeiteiro.jpg`
- `trufado.jpg`
- `de-colher.jpg`
- `trio.jpg`

Se a imagem não for encontrada, o site usa um emoji como substituto automaticamente.

---

## ➕ Adicionando Novos Produtos / Categorias

Edite o arquivo `data/products.json`:

### Nova categoria (ex: Bolos)

```json
{
  "id": "bolos",
  "label": "Bolos",
  "icon": "🎂",
  "description": "Bolos artesanais para todas as ocasiões",
  "active": false
}
```

### Novo produto na categoria Bolos

```json
{
  "id": "bolo-cenoura",
  "category": "bolos",
  "name": "Bolo de Cenoura",
  "description": "Bolo de cenoura fofinho com cobertura de brigadeiro.",
  "image": "assets/images/bolo-cenoura.jpg",
  "imageFallback": "🎂",
  "flavors": [
    { "id": "brigadeiro", "label": "Com Brigadeiro" },
    { "id": "creme", "label": "Com Creme" }
  ],
  "weights": [
    { "id": "500g", "label": "500g (pequeno)", "price": 45.00 },
    { "id": "1kg",  "label": "1kg (grande)",   "price": 80.00 }
  ],
  "badge": null,
  "badgeColor": null
}
```

Pronto! O site vai mostrar a nova categoria automaticamente na barra de navegação. 🎉

---

## 📲 Configurando o WhatsApp

Em `js/app.js`, linha 9:

```js
const WHATSAPP_NUMBER = '5584991087606'; // Número com DDI + DDD, sem + ou espaços
```

---

## 🚀 Como rodar localmente

Por usar `import` ES Modules e `fetch()` para o JSON, o site precisa de um
servidor HTTP local (não funciona abrindo direto o arquivo HTML).

**Opção 1 — VS Code Live Server**
Instale a extensão "Live Server" e clique em "Go Live".

**Opção 2 — Python**
```bash
cd mary-restaurante
python3 -m http.server 8080
# Abra: http://localhost:8080
```

**Opção 3 — Node.js (npx)**
```bash
cd mary-restaurante
npx serve .
```

---

## 🔮 Próximas categorias sugeridas

- `pascoa` ✅ (já existe)
- `bolos` — Bolos artesanais
- `doces` — Doces finos
- `salgados` — Salgados
- `kits` — Kits presenteáveis

Basta adicionar no JSON e enviar as fotos!
