import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const Charts = ({ analytics }) => {
  console.log('Analytics data:', analytics); // Debug log
  
  // Process data for charts with better error handling
  const categoryData = (analytics?.categories || []).map((cat, index) => ({
    ...cat,
    color: COLORS[index % COLORS.length]
  }));

  console.log('Category data:', categoryData); // Debug log

  const processedTrends = (analytics?.trends || []).reduce((acc, trend) => {
    // Add null checks for trend._id
    if (!trend._id) return acc;
    
    const dateKey = trend._id.day 
      ? `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`
      : `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
    
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
    }
    
    if (trend._id.type) {
      acc[dateKey][trend._id.type] = trend.total || 0;
    }
    return acc;
  }, {});

  const trendsData = Object.values(processedTrends).sort((a, b) => a.date.localeCompare(b.date));

  console.log('Trends data:', trendsData); // Debug log

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: $${entry.value?.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Spending by Category - Pie Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="amount"
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((category) => (
                <div key={category.category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-600 truncate">
                    {category.category} (${category.amount?.toFixed(2)})
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p className="text-center text-lg font-medium">No Category Data</p>
            <p className="text-center text-sm">Add some expense transactions to see category breakdown</p>
          </div>
        )}
      </div>

      {/* Income vs Expenses Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
        {trendsData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    try {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    } 
                    catch {
                      return value;
                    }
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Line Chart Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 font-medium">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 font-medium">Expenses</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1-1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-center text-lg font-medium">No Trend Data</p>
            <p className="text-center text-sm">Add transactions over time to see income vs expense trends</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;