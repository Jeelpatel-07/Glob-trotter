import { DollarSign } from 'lucide-react';
import Card from '../common/Card';
import { CategoryPieChart, DailyBarChart } from './BudgetCharts';

export default function BudgetSection({ budget }) {
  const totalBudget = budget?.totalBudget || budget?.budget || 0;
  const totalSpent = budget?.totalSpent || budget?.total || 0;
  const isOverBudget = budget?.isOverBudget || budget?.overBudget || false;
  const categoryBreakdown = budget?.categoryBreakdown || budget?.categories || [];
  const dailySpending = budget?.dailySpending || budget?.daily || [];

  return (
    <Card className="budget-card">
      <h3 className="section-title">
        <DollarSign size={16} /> Budget Overview
      </h3>

      {totalBudget > 0 && (
        <div className="budget-bar-container">
          <div className="budget-bar">
            <div
              className={`budget-bar-fill ${isOverBudget ? 'over' : ''}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <div className="budget-bar-labels">
            <span>${totalSpent} spent</span>
            <span>${totalBudget} budget</span>
          </div>
        </div>
      )}

      <CategoryPieChart data={categoryBreakdown} />
      <DailyBarChart data={dailySpending} />
    </Card>
  );
}
