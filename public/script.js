
const API_URL = '/books';

const bookForm = document.getElementById('bookForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const priceInput = document.getElementById('price');

const bookList = document.getElementById('bookList');
const bookCount = document.getElementById('bookCount');

const message = document.getElementById('message');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

let editingId = null;

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

// Reset form
function resetForm() {
    bookForm.reset();
    editingId = null;

    formTitle.textContent = 'Add New Book';
    submitBtn.textContent = 'Add Book';
    cancelBtn.hidden = true;
}

// GET - Fetch all books
async function getBooks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to fetch books');
        }

        const books = await response.json();

        displayBooks(books);

    } catch (error) {

        bookList.textContent = 'Error loading books. Please try again.';
        showMessage(error.message, 'error');

    }
}

// Display books dynamically
function displayBooks(books) {

    bookList.replaceChildren();

    bookCount.textContent =
        `${books.length} ${books.length === 1 ? 'Book' : 'Books'}`;

    if (books.length === 0) {
        bookList.textContent = 'No books available. Add a new book!';
        return;
    }

    books.forEach(book => {

        const card = document.createElement('div');
        card.className = 'book-card';

        const heading = document.createElement('h3');
        heading.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = `Author: ${book.author}`;

        const id = document.createElement('p');
        id.textContent = `Book ID: ${book.id}`;

        const price = document.createElement('p');
        price.className = 'book-price';
        price.textContent = `₹${book.price}`;

        const actions = document.createElement('div');
        actions.className = 'book-actions';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-btn';
        editButton.addEventListener('click', () => editBook(book.id));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => deleteBook(book.id));

        actions.append(editButton, deleteButton);

        card.append(heading, author, id, price, actions);

        bookList.appendChild(card);

    });
}

// POST and PUT - Add or update book
bookForm.addEventListener('submit', async function(event) {

    event.preventDefault();

    const book = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        price: priceInput.value
    };

    if (
        !book.title ||
        !book.author ||
        book.price === '' ||
        !Number.isFinite(Number(book.price)) ||
        Number(book.price) < 0
    ) {
        showMessage('Please enter valid book details', 'error');
        return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

    const method = isEditing ? 'PUT' : 'POST';

    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(book)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Operation failed');
        }

        showMessage(data.message, 'success');

        resetForm();

        await getBooks();

    } catch (error) {

        showMessage(error.message, 'error');

    }

});

// Edit book
async function editBook(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const book = await response.json();

        if (!response.ok) {
            throw new Error(book.message);
        }

        titleInput.value = book.title;
        authorInput.value = book.author;
        priceInput.value = book.price;

        editingId = id;

        formTitle.textContent = 'Update Book Details';
        submitBtn.textContent = 'Update Book';
        cancelBtn.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {

        showMessage(error.message, 'error');

    }

}

// DELETE - Delete book
async function deleteBook(id) {

    const confirmDelete = confirm(
        'Are you sure you want to delete this book?'
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (editingId === id) {
            resetForm();
        }

        showMessage(data.message, 'success');

        await getBooks();

    } catch (error) {

        showMessage(error.message, 'error');

    }

}

// Cancel editing
cancelBtn.addEventListener('click', resetForm);

// Load books when page opens
getBooks();
