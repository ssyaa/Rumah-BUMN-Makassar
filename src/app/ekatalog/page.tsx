"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter untuk navigasi
import { firestore } from "@/../firebase-config";
import { collection, getDocs, query, where, Query } from "firebase/firestore";
import "./catalog.css";

const Ecatalog: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQuery, setSelectedQuery] = useState("Semua Jenis UMKM");
    const [products, setProducts] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 16;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let productsQuery: Query<any> = collection(firestore, "products");

                if (selectedQuery !== "Semua Jenis UMKM") {
                    productsQuery = query(productsQuery, where("jenisUMKM", "==", selectedQuery));
                }

                const querySnapshot = await getDocs(productsQuery);
                const productsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id, // Ambil ID dokumen sebagai productId
                    ...doc.data(),
                }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            }
        };

        fetchProducts();
    }, [selectedQuery]);

    const handleProductClick = (productId: string) => {
        router.push(`/review/${productId}`); // Navigasi ke halaman review berdasarkan productId
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePagination = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="ecatalog-container">
            <h1 className="ecatalog-title">E-Katalog Produk UMKM</h1>
            <div className="ecatalog-search-container">
                <input
                    type="text"
                    placeholder="Masukkan kata kunci pencarian"
                    className="ecatalog-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="ecatalog-filter"
                    value={selectedQuery}
                    onChange={(e) => setSelectedQuery(e.target.value)}
                >
                    <option>Semua Jenis UMKM</option>
                    <option>F&B</option>
                    <option>Fashion</option>
                    <option>Craft</option>
                    <option>Beauty</option>
                </select>
                <button className="ecatalog-search-button">Cari</button>
            </div>

            {products.length === 0 ? (
                <p className="text-center">Sedang memuat produk...</p>
            ) : (
                <div className="ecatalog-product-container">
                    {currentProducts.map((product) => (
                        <div
                            key={product.id}
                            className="ecatalog-product-card"
                            onClick={() => handleProductClick(product.id)} // Tambahkan event klik
                            style={{ cursor: "pointer" }} // Ubah cursor jadi pointer agar lebih jelas bisa diklik
                        >
                            <img
                                src={product.fotoProduk || "/placeholder.png"}
                                alt={product.namaBrand || "Produk"}
                                className="product-img"
                            />
                            <div className="product-details">
                                <p className="product-brand">{product.namaBrand}</p>
                                <p className="product-owner">{product.namaOwner}</p>
                                <p className="product-desc">{product.descProduct}</p>
                                <p className="product-price">Rp {product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {products.length > 16 && (
                <div className="pagination">
                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => handlePagination(number)}
                            className={`pagination-button ${currentPage === number ? "active" : "inactive"}`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Ecatalog;
