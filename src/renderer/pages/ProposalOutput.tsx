import { cn } from "@/lib/utils";

function ProposalOutputPage() {
  return (
    <div className={cn("min-h-screen bg-white p-8 text-black")}>
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between">
        {/* Logo Placeholder */}
        <div className="flex h-20 w-32 items-center justify-center border-2 border-gray-400 bg-gray-100 text-xs text-gray-600">
          COMPANY LOGO
        </div>

        {/* Proposal Title */}
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold underline">PROPOSAL</h1>
          <p className="mt-1 text-lg underline">E26-01</p>
        </div>

        {/* Right spacer for centering */}
        <div className="w-32"></div>
      </div>

      {/* Metadata Section */}
      <div className="mb-6 space-y-1">
        <p>
          <strong>DATE:</strong> 1/25/2026
        </p>
        <p>
          <strong>PROJECT:</strong> Serrano Pointe Commerce Center
        </p>
        <p>
          <strong>SITE ADDRESS:</strong> Hesperia, CA
        </p>
        <p>
          <strong>POINT OF CONTACT:</strong> David Golkar
        </p>
      </div>

      {/* Base Agreement Table */}
      <table className="mb-1 w-full border-collapse border border-black">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-black p-2 text-center">Item</th>
            <th className="border border-black p-2 text-left">Base Agreement</th>
            <th className="border border-black p-2 text-center">Quantity</th>
            <th className="border border-black p-2 text-center">Unit</th>
            <th className="border border-black p-2 text-center">Cost</th>
            <th className="border border-black p-2 text-center">Dur</th>
            <th className="border border-black p-2 text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center">1</td>
            <td className="border border-black p-2">
              Compac III Keystone MSE Walls (5) in Natural Stone Face
            </td>
            <td className="border border-black p-2 text-right">7,850</td>
            <td className="border border-black p-2 text-center">SF</td>
            <td className="border border-black p-2 text-right">$48.10</td>
            <td className="border border-black p-2 text-center">TBD</td>
            <td className="border border-black p-2 text-right">$377,585.00</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">2</td>
            <td className="border border-black p-2">Leveling Pad Excavation</td>
            <td className="border border-black p-2 text-center">INCLUDED</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">INCLUDED</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">3</td>
            <td className="border border-black p-2">
              NFC fill @ wall 1 (up to Zeq)
            </td>
            <td className="border border-black p-2 text-center">INCLUDED</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">INCLUDED</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">4</td>
            <td className="border border-black p-2">
              "Post In" Fence anchoring unit (up to 140) (Assumed 8' OC)
            </td>
            <td className="border border-black p-2 text-center">INCLUDED</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">INCLUDED</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">5</td>
            <td className="border border-black p-2">
              "Heel Drain at wall 5 (up to 51 lf as shown on RW plan)
            </td>
            <td className="border border-black p-2 text-center">INCLUDED</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">INCLUDED</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">6</td>
            <td className="border border-black p-2">
              95% compaction in wall fill zones (as noted on RW plan)
            </td>
            <td className="border border-black p-2 text-center">INCLUDED</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">INCLUDED</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">7</td>
            <td className="border border-black p-2">Mobilization (1 Included)</td>
            <td className="border border-black p-2 text-right">1</td>
            <td className="border border-black p-2 text-center">EA</td>
            <td className="border border-black p-2 text-right">$6,900.00</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">$6,900.00</td>
          </tr>
          <tr className="bg-slate-200">
            <td
              colSpan={6}
              className="border border-black p-2 text-center font-bold"
            >
              DESCRIPTION
            </td>
            <td className="border border-black p-2 text-right font-bold">
              $384,485.00
            </td>
          </tr>
        </tbody>
      </table>

      {/* Optional Items Table */}
      <table className="mb-6 w-full border-collapse border border-black">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-black p-2 text-center">Item</th>
            <th className="border border-black p-2 text-left">Optional Items</th>
            <th className="border border-black p-2 text-center">Quantity</th>
            <th className="border border-black p-2 text-center">Unit</th>
            <th className="border border-black p-2 text-center">Cost</th>
            <th className="border border-black p-2 text-center">Dur</th>
            <th className="border border-black p-2 text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2 text-center">8</td>
            <td className="border border-black p-2">
              Block face/color upgrade (natural grey color is included)
            </td>
            <td className="border border-black p-2 text-right">1</td>
            <td className="border border-black p-2 text-center">SF</td>
            <td className="border border-black p-2 text-right">$1.25-$5.60</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right">Varies</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">9</td>
            <td className="border border-black p-2">
              B11-47 Caltrans Type Cable Railing (4 strand)
            </td>
            <td className="border border-black p-2 text-right">1,069</td>
            <td className="border border-black p-2 text-center">LF</td>
            <td className="border border-black p-2 text-right">$95.00</td>
            <td className="border border-black p-2 text-center">TBD</td>
            <td className="border border-black p-2 text-right">$101,555.00</td>
          </tr>
          <tr>
            <td className="border border-black p-2 text-center">10</td>
            <td className="border border-black p-2">
              Mix & Moisture Conditioned backfill soil for Keystone Walls
            </td>
            <td className="border border-black p-2 text-right">3,650</td>
            <td className="border border-black p-2 text-center">CY</td>
            <td className="border border-black p-2 text-right">$7.00</td>
            <td className="border border-black p-2 text-center">TBD</td>
            <td className="border border-black p-2 text-right">$25,550.00</td>
          </tr>
        </tbody>
      </table>

      {/* Documents Used for this Proposal Table */}
      <table className="mb-4 w-full border-collapse border border-black">
        <thead>
          <tr className="bg-slate-200">
            <th
              colSpan={3}
              className="border border-black p-2 text-center font-bold"
            >
              Documents used for this Proposal
            </th>
            <th className="border border-black p-2 text-center font-bold">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">Site Plan</td>
            <td colSpan={2} className="border border-black p-2">
              RW Plans-Rev 2
            </td>
            <td className="border border-black p-2 text-center">N/A</td>
          </tr>
          <tr>
            <td className="border border-black p-2"></td>
            <td colSpan={2} className="border border-black p-2">
              "SERRANO POINTE COMMERCE CENTER..."
            </td>
            <td className="border border-black p-2 text-center">1-22-25</td>
          </tr>
        </tbody>
      </table>

      {/* Assumed Soil Parameters Table */}
      <table className="mb-6 w-full border-collapse border border-black">
        <thead>
          <tr className="bg-slate-200">
            <th
              colSpan={2}
              className="border border-black p-2 text-center font-bold"
            >
              Assumed Soil Parameters
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">Seismic</td>
            <td className="border border-black p-2">Not Provided</td>
          </tr>
          <tr>
            <td className="border border-black p-2">Unit Weight</td>
            <td className="border border-black p-2">Not Provided</td>
          </tr>
          <tr>
            <td className="border border-black p-2">
              Phi Angle-Internal friction
            </td>
            <td className="border border-black p-2">Not Provided</td>
          </tr>
          <tr>
            <td className="border border-black p-2">Plasticity Index</td>
            <td className="border border-black p-2">Not Provided</td>
          </tr>
        </tbody>
      </table>

      {/* Special Conditions Section */}
      <div className="mb-6">
        <h2 className="mb-2 font-bold underline">
          SPECIAL CONDITIONS RELATED TO THIS PROJECT:
        </h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            Natural (Grey) block included. Other colors or facings are available
            at an additional price.
          </li>
          <li>Non union, non prevailing wage job.</li>
          <li>
            Backfill material to be stockpiled within 25' of each wall;
            Processed, Moisture Conditioned, and ready for placement. (By Others
            - See Exclusions)
          </li>
          <li>
            WALLS 1-5 Backcut Requirements: WALL 1: Cut 14.5' back from FW/ 1'
            above BW. WALL 2: Cut 13.5' back from FW/ 1' above BW. WALL 3: Cut
            16.5' back from FW (from STA 2+07 to 2+46)/ 1' above BW. WALL 4: Cut
            13.5' back from FW/ 1' above BW. WALL 5: Cut 18' back from FW/ 1'
            above BW (from STA 0+50 to 0+79) Cut 14.5' back from FW (from STA
            0+79 to STA 1+08)/ 1' above BW. ***WALLS 4 AND 5 ARE BACKCUT
            TOGETHER.
          </li>
          <li>
            Any additional details or revised wall plans may add cost to the
            walls.
          </li>
          <li>
            Wall-Fill must be approved by Geo-technical Engineer prior to
            Mobilization
          </li>
        </ol>
      </div>

      {/* EH FREEMAN Responsibilities Section */}
      <div className="mb-6">
        <h2 className="mb-2 font-bold underline">
          EH FREEMAN will be responsible for:
        </h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            Base Agreement Items: Walls backfilled to top of wall with owner
            supplied soil (Wall caps to be exposed above wall fill)
          </li>
          <li>
            All labor, materials and equipment required for construction of
            Walls. Leveling pad excavation is included.
          </li>
          <li>
            95% compaction in "Reinforced Wall Fill Zones" for Keystone walls
            1-5
          </li>
          <li>
            "Post In" Fence anchoring unit (up to 140) (Assumed 8' on Center/
            Additional cost for Installation less than 8' OC)
          </li>
          <li>
            When EH FREEMAN does not finish a project in full due to others,
            Each remobilization or re-start is $7000.
          </li>
          <li>
            Backfill level to top of wall and compaction of soil within the grid
            reinforcement zone is included. Compaction to 95% relative
            compaction using ASTM D1557 modified proctor.
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p>Tomocula CA</p>
        <p>214-208-6093</p>
      </div>
    </div>
  );
}

export default ProposalOutputPage;
