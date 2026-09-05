import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import { getAvailableStock } from "../../utils/inventoryUtils";
import WishlistButton from "../../components/WishlistButton";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../styles/pages.css";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const availableStock = product ? getAvailableStock(product, cartItems) : 0;

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      if (!data) {
        setError("Product not found");
      } else {
        setProduct(data);
        setSelectedImageIndex(0);
      }
    } catch (err) {
      setError("Failed to load product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const storedImages = product.images?.filter(Boolean) || [];
  const productImages = storedImages.length
    ? storedImages
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const selectedImage = productImages[selectedImageIndex] || productImages[0];

  const showPreviousImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? productImages.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === productImages.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back to Home
      </button>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="product-image">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} />
            ) : (
              <div className="placeholder">No image</div>
            )}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={showPreviousImage}
                  aria-label="Previous product image"
                >
                  <FiChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={showNextImage}
                  aria-label="Next product image"
                >
                  <FiChevronRight size={22} />
                </button>
              </>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="product-thumbnails" aria-label="Product images">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`product-thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-info-content">
            <div className="product-title-row">
              <h1>{product.name}</h1>
              <WishlistButton product={product} />
            </div>
            <p className="category">{product.category}</p>
            <p className="description">{product.description}</p>
          </div>

          <div className="product-meta">
            <div className="price-section">
              {product.oldPrice && (
                <div className="old-price">
                  <s>{product.oldPrice} LE</s>
                </div>
              )}
              <div className="price">{product.price} LE</div>
            </div>
            {availableStock === 0 ? (
              <div className="stock out-stock">Out of Stock</div>
            ) : availableStock <= 5 ? (
              <div className="stock low-stock">Only {availableStock} left</div>
            ) : null}
          </div>

          {availableStock > 0 && (
            <div className="product-purchase-controls">
              <div className="card-actions">
                <div className="quantity-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                    disabled={quantity === 1}
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(availableStock, quantity + 1))
                    }
                    className="qty-btn"
                    disabled={quantity === availableStock}
                  >
                    +
                  </button>
                </div>
                <button className="btn-add-to-cart" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
