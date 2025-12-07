// components/CartButton/CartButton.tsx
import './CartButton.css';

interface CartButtonProps {
  onClick: () => void;
  count?: number;
  loading?: boolean; // Добавьте этот пропс
}

export default function CartButton({ onClick, count = 0, loading = false }: CartButtonProps) {
  return (
    <div className="wrench-after-fourth">
      <button 
        className="cart-button" 
        onClick={onClick}
        disabled={loading} // Добавьте disabled
      >
        {loading ? (
          <span className="loading-text">Загрузка...</span>
        ) : (
          <>
            <i className="fas fa-wrench fa-4x"></i>
            {count > 0 && <span className="cart-count">{count}</span>}
          </>
        )}
      </button>
    </div>
  );
}