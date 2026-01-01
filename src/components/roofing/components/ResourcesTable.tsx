import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';


interface ResourcesTableProps {
  area: number; // in square feet
  perimeter: number; // in linear feet
  totalLineLength: number; // in linear feet (for capping)
  savedMeasurements: any; // saved measurement data
}

interface ResourceItem {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  url?: string;
}

export function ResourcesTable({ area, perimeter, totalLineLength, savedMeasurements }: ResourcesTableProps) {
  // Use savedMeasurements data if available, otherwise use props
  const effectiveArea = savedMeasurements?.area || area || 0;
  const effectivePerimeter = savedMeasurements?.perimeter || perimeter || 0;
  const effectiveTotalLineLength = savedMeasurements?.totalLineLength || totalLineLength || 0;

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (savedMeasurements && effectiveArea > 0) {
      setShouldRender(true);

      // Synchronous calculations using fallback pricing
      setLoading(true);

      const underlaymentData = { name: 'GAF FeltBuster Underlayment', price: 151.0, unitType: 'sqft', coverageArea: 1000 };
      const leakBarrierData = { name: 'GAF WeatherWatch Leak Barrier', price: 97.96, unitType: 'sqft', coverageArea: 200 };
      const shinglesData = { name: 'GAF Timberline HDZ Shingles', price: 45.11, unitType: 'sqft', coverageArea: 33.3 };
      const starterStripData = { name: 'GAF WeatherBlocker Starter Strips', price: 65.75, unitType: 'linear_foot', coverageArea: 50 };
      const ridgeCapData = { name: 'GAF Timbertex Ridge Caps', price: 59.75, unitType: 'linear_foot', coverageArea: 20 };

      // Calculate all quantities
      const underlaymentArea = effectiveArea * 1.1; // 10% waste
      const underlaymentRolls = Math.ceil(underlaymentArea / underlaymentData.coverageArea);
      const underlaymentCost = underlaymentRolls * underlaymentData.price;

      const leakBarrierArea = effectiveArea * 1.05; // 5% waste
      const leakBarrierRolls = Math.ceil(leakBarrierArea / leakBarrierData.coverageArea);
      const leakBarrierCost = leakBarrierRolls * leakBarrierData.price;

      const shinglesArea = effectiveArea * 1.05; // 5% waste
      const shinglesBundles = Math.ceil(shinglesArea / shinglesData.coverageArea);
      const shinglesCost = shinglesBundles * shinglesData.price;

      const starterStripLength = effectivePerimeter * 1.05; // 5% waste
      const starterStripUnits = Math.ceil(starterStripLength / starterStripData.coverageArea);
      const starterStripCost = starterStripUnits * starterStripData.price;

      const ridgeCapLength = effectiveTotalLineLength * 1.05; // 5% waste
      const ridgeCapBundles = Math.ceil(ridgeCapLength / ridgeCapData.coverageArea);
      const ridgeCapCost = ridgeCapBundles * ridgeCapData.price;

        const calculatedResources: ResourceItem[] = [
          {
            name: 'GAF Timberline HDZ Weathered Wood High Definition Roof Shingles',
            quantity: shinglesBundles,
            unit: 'bundles',
            unitCost: shinglesData.price,
            totalCost: shinglesCost,
            url: 'https://www.homedepot.ca/product/gaf-timberline-hdz-weathered-wood-high-definition-roof-shingles-33-3-sq-ft-per-bdl-21-pcs-/1000730987'
          },
          {
            name: 'GAF FeltBuster Synthetic Roofing Underlayment',
            quantity: underlaymentRolls,
            unit: 'rolls',
            unitCost: underlaymentData.price,
            totalCost: underlaymentCost,
            url: 'https://www.homedepot.ca/product/gaf-1000-sq-ft-feltbuster-synthetic-roofing-underlayment-roll/1000800427'
          },
          {
            name: 'GAF WeatherWatch Mineral Surfaced Peel and Stick Roof Leak Barrier',
            quantity: leakBarrierRolls,
            unit: 'rolls',
            unitCost: leakBarrierData.price,
            totalCost: leakBarrierCost,
            url: 'https://www.homedepot.ca/product/gaf-200-sq-ft-weatherwatch-mineral-surfaced-peel-and-stick-roof-leak-barrier-roll/1000731325'
          },
          {
            name: 'GAF WeatherBlocker Premium Eave and Rake Roof Starter Strip Shingles',
            quantity: starterStripUnits,
            unit: 'units',
            unitCost: starterStripData.price,
            totalCost: starterStripCost,
            url: 'https://www.homedepot.ca/product/gaf-weatherblocker-50-lin-ft-premium-eave-and-rake-roof-starter-strip-shingles/1000731326'
          },
          {
            name: 'GAF Timbertex Charcoal Premium Hip and Ridge Cap Roof Shingles',
            quantity: ridgeCapBundles,
            unit: 'bundles',
            unitCost: ridgeCapData.price,
            totalCost: ridgeCapCost,
            url: 'https://www.homedepot.ca/product/gaf-timbertex-charcoal-premium-hip-and-ridge-cap-roof-shingles-20-lin-ft-per-bundle-30-pieces-/1001016707'
          }
        ];

      setResources(calculatedResources);
      setLoading(false);
    } else {
      setShouldRender(false);
    }
    }, [savedMeasurements, effectiveArea, effectivePerimeter, effectiveTotalLineLength]); // Dependencies still work since effective values are derived from these

  if (!shouldRender) return null;

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Calculating material costs...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 border-red-200">
        <CardContent className="pt-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (resources.length === 0) {
    return null;
  }

  const totalCost = resources.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <Card className="mt-6 border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Material Requirements</CardTitle>
        <CardDescription className="text-gray-600">
          Estimated materials needed for {effectiveArea.toFixed(0)} sq ft roof area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Material</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">With Buffer</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Est. Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cost +20%</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((item, index) => {
                  const quantityWithBuffer = Math.ceil(item.quantity * 1.2); // +20% buffer, rounded up
                  const totalWithBuffer = quantityWithBuffer * item.unitCost;

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{item.name}</div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            (View Product)
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                        {quantityWithBuffer} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        ${item.unitCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        ${item.totalCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                        ${totalWithBuffer.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-4 font-semibold text-gray-900" colSpan={4}>
                    Total Estimated Cost
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    ${totalCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-blue-600">
                    ${(totalCost * 1.2).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="font-medium text-yellow-800 mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>All prices are estimates and may vary by location and retailer</li>
              <li>Quantities include waste factors for cutting and installation</li>
              <li><strong>+20% columns</strong> show recommended buffer quantities for unexpected needs</li>
              <li>Labor costs, additional materials, and disposal not included</li>
              <li>Always verify local building codes and obtain necessary permits</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
