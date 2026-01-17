// Do your work here...
console.log('Hello, world!');

// Bookshelf App - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Konstanta dan variabel
    const STORAGE_KEY = 'bookshelf_app';
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    const bookForm = document.getElementById('bookForm');
    const searchForm = document.getElementById('searchBook');
    const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
    const submitButton = document.getElementById('bookFormSubmit');
    
    // Array untuk menyimpan buku
    let books = [];
    
    // Event listener untuk checkbox
    isCompleteCheckbox.addEventListener('change', function() {
        const span = submitButton.querySelector('span');
        span.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });
    
    // Inisialisasi
    loadBooksFromStorage();
    renderBooks();
    
    // Fungsi untuk menyimpan data ke localStorage
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
    
    // Fungsi untuk memuat data dari localStorage
    function loadBooksFromStorage() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            books = JSON.parse(storedData);
        }
    }
    
    // Fungsi untuk menghasilkan ID unik
    function generateId() {
        return Date.now();
    }
    
    // Fungsi untuk membuat elemen buku
    function createBookElement(book) {
        const bookElement = document.createElement('div');
        bookElement.setAttribute('data-bookid', book.id);
        bookElement.setAttribute('data-testid', 'bookItem');
        bookElement.classList.add('book-item');
        
        bookElement.innerHTML = `
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
            <p data-testid="bookItemYear">Tahun: ${book.year}</p>
            <div>
                <button data-testid="bookItemIsCompleteButton" class="status-btn">
                    ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
                </button>
                <button data-testid="bookItemDeleteButton" class="delete-btn">
                    Hapus Buku
                </button>
                <button data-testid="bookItemEditButton" class="edit-btn">
                    Edit Buku
                </button>
            </div>
        `;
        
        return bookElement;
    }
    
    // Fungsi untuk merender semua buku
    function renderBooks(filteredBooks = null) {
        const booksToRender = filteredBooks || books;
        
        // Kosongkan daftar
        incompleteBookList.innerHTML = '';
        completeBookList.innerHTML = '';
        
        // Render buku berdasarkan status
        booksToRender.forEach(book => {
            const bookElement = createBookElement(book);
            
            if (book.isComplete) {
                completeBookList.appendChild(bookElement);
            } else {
                incompleteBookList.appendChild(bookElement);
            }
        });
        
        // Tambahkan event listener untuk tombol
        addEventListenersToButtons();
    }
    
    // Fungsi untuk menambahkan event listener ke tombol
    function addEventListenersToButtons() {
        // Tombol ubah status (Selesai/Belum selesai)
        document.querySelectorAll('[data-testid="bookItemIsCompleteButton"]').forEach(button => {
            button.addEventListener('click', function() {
                const bookElement = this.closest('[data-testid="bookItem"]');
                const bookId = parseInt(bookElement.getAttribute('data-bookid'));
                
                // Cari buku berdasarkan ID
                const bookIndex = books.findIndex(book => book.id === bookId);
                if (bookIndex !== -1) {
                    // Ubah status
                    books[bookIndex].isComplete = !books[bookIndex].isComplete;
                    saveToStorage();
                    renderBooks();
                }
            });
        });
        
        // Tombol hapus
        document.querySelectorAll('[data-testid="bookItemDeleteButton"]').forEach(button => {
            button.addEventListener('click', function() {
                const bookElement = this.closest('[data-testid="bookItem"]');
                const bookId = parseInt(bookElement.getAttribute('data-bookid'));
                
                if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
                    // Hapus buku dari array
                    books = books.filter(book => book.id !== bookId);
                    saveToStorage();
                    renderBooks();
                }
            });
        });
        
        // Tombol edit
        document.querySelectorAll('[data-testid="bookItemEditButton"]').forEach(button => {
            button.addEventListener('click', function() {
                const bookElement = this.closest('[data-testid="bookItem"]');
                const bookId = parseInt(bookElement.getAttribute('data-bookid'));
                
                // Cari buku berdasarkan ID
                const book = books.find(book => book.id === bookId);
                if (book) {
                    // Isi form dengan data buku yang akan diedit
                    document.getElementById('bookFormTitle').value = book.title;
                    document.getElementById('bookFormAuthor').value = book.author;
                    document.getElementById('bookFormYear').value = book.year;
                    document.getElementById('bookFormIsComplete').checked = book.isComplete;
                    
                    // Ubah teks tombol submit
                    submitButton.textContent = 'Update Buku';
                    submitButton.querySelector('span').textContent = book.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
                    
                    // Tambahkan atribut data-edit-id untuk mengetahui ini mode edit
                    bookForm.setAttribute('data-edit-id', bookId);
                }
            });
        });
    }
    
    // Event listener untuk form tambah/update buku
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('bookFormTitle').value.trim();
        const author = document.getElementById('bookFormAuthor').value.trim();
        const year = parseInt(document.getElementById('bookFormYear').value);
        const isComplete = document.getElementById('bookFormIsComplete').checked;
        const editId = this.getAttribute('data-edit-id');
        
        // Validasi input
        if (!title || !author || !year) {
            alert('Semua field harus diisi!');
            return;
        }
        
        if (editId) {
            // Mode edit - update buku yang ada
            const bookId = parseInt(editId);
            const bookIndex = books.findIndex(book => book.id === bookId);
            
            if (bookIndex !== -1) {
                books[bookIndex] = {
                    id: bookId,
                    title,
                    author,
                    year,
                    isComplete
                };
                
                // Hapus atribut edit
                bookForm.removeAttribute('data-edit-id');
                // Reset teks tombol
                submitButton.textContent = 'Masukkan Buku ke rak ';
                const span = document.createElement('span');
                span.textContent = 'Belum selesai dibaca';
                submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
            }
        } else {
            // Mode tambah - buat buku baru
            const newBook = {
                id: generateId(),
                title,
                author,
                year,
                isComplete
            };
            
            books.push(newBook);
        }
        
        // Simpan dan render ulang
        saveToStorage();
        renderBooks();
        
        // Reset form
        bookForm.reset();
        // Reset span di tombol submit
        submitButton.querySelector('span').textContent = 'Belum selesai dibaca';
    });
    
    // Event listener untuk form pencarian
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const searchTerm = document.getElementById('searchBookTitle').value.trim().toLowerCase();

        if (!searchTerm) {
            // Jika pencarian kosong, tampilkan semua buku
            renderBooks();
            return;
        }

        // Cari buku berdasarkan judul
        const foundBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm)
        );

        const modal = document.getElementById('searchResultModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');

        if (foundBooks.length === 0) {
            modalTitle.textContent = 'Upss!';
            modalMessage.textContent = 'Bukunya gaada di rak mana pun.';
        } else {
            const readBooks = foundBooks.filter(book => book.isComplete);
            const unreadBooks = foundBooks.filter(book => !book.isComplete);

            let message = '';
            if (readBooks.length > 0) {
                message += `Ada di kolom "Selesai dibaca" (${readBooks.length} buku). `;
            }
            if (unreadBooks.length > 0) {
                message += `Ada di kolom "Belum selesai dibaca" (${unreadBooks.length} buku).`;
            }

            modalTitle.textContent = 'Hasil Pencarian';
            modalMessage.textContent = message.trim();
        }

        modal.style.display = 'flex';
    });

    // Event listener untuk tombol tutup modal
    document.getElementById('closeModal').addEventListener('click', function() {
        const modal = document.getElementById('searchResultModal');
        modal.style.display = 'none';
    });

    // Tutup modal jika klik di luar modal
    document.getElementById('searchResultModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    

});