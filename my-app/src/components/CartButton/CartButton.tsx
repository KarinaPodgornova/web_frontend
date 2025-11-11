// CartButton.tsx
import './CartButton.css';

interface CartButtonProps {
  onClick: () => void;
  count?: number;
}

export default function CartButton({ onClick, count = 0 }: CartButtonProps) {
  return (
    <div className="wrench-after-fourth">
      <button className="cart-button" onClick={onClick}>
        <i className="fas fa-wrench fa-4x"></i>
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </div>
  );
}