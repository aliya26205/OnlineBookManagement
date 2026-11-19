
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Book storage
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 299
    },
    {
        id: 2,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        price: 250
    },
    {
        id: 3,
        title: "Java Programming",
        author: "Herbert Schildt",
        price: 450
    }
];

// Validate book details
function validateBook(req, res, next) {
    const { title, author, price } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim() ||
        price === undefined ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please provide valid title, author and price"
        });
    }

    next();
}

// 1. GET - Retrieve all books
app.get('/books', (req, res) => {
    res.json(books);
});

// 2. GET - Retrieve a particular book
app.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);

    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});

// 3. POST - Add a new book
app.post('/books', validateBook, (req, res) => {
    const { title, author, price } = req.body;

    const newBook = {
        id: books.length
            ? Math.max(...books.map(b => b.id)) + 1
            : 1,
        title: title.trim(),
        author: author.trim(),
        price: Number(price)
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

// 4. PUT - Update book details
app.put('/books/:id', validateBook, (req, res) => {
    const id = Number(req.params.id);

    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price } = req.body;

    book.title = title.trim();
    book.author = author.trim();
    book.price = Number(price);

    res.json({
        message: "Book updated successfully",
        book: book
    });
});

// 5. DELETE - Delete a book
app.delete('/books/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.json({
        message: "Book deleted successfully"
    });
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
