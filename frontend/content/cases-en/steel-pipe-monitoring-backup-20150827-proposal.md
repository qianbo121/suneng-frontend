Suneng's 2015 proposal for a large gas-fired steel-pipe annealing furnace specifies an uninterruptible power supply to maintain computer monitoring during emergency or short power interruptions. It separately requires automatic gas-valve closure on power failure. Confirm which monitoring and recording functions continue, and distinguish their backup supply from combustion, fans and mechanical drives.

## Define the functions receiving backup power

| Item | Original proposal | Boundary to clarify |
| --- | --- | --- |
| Backup-power purpose | Maintain computer monitoring during emergency or short outages | Final connected-load list and duration |
| Alarm history | Record occurrence, acknowledgement and clearance times | Screen indications and history must refer to the same event |
| Furnace-temperature control | 18 zones | Whether zone instruments, acquisition and communications receive backup power |

An uninterruptible power supply provides temporary power to specified loads when the mains fails. The source limits its stated purpose to computer monitoring, without a duration in minutes or a complete connection list. Identify which computers, acquisition devices, instruments and communication devices are connected. An equipment name alone does not establish an uninterrupted data chain.

## A lit screen may not contain fresh readings

The computer exchanges data with temperature, pressure and flow systems through lower-level controls, displaying actual temperatures, pressures, flows and burner states. To verify monitoring during an outage, check that the required sensors, acquisition and communications remain operational. Otherwise, a last displayed value is not a continuously updated operating condition. Wiring and functional tests must support that conclusion; it is not assumed here.

Alarm history includes occurrence, acknowledgement and clearance times, supporting an event-traceability requirement. The final design should identify events recorded during power loss and restoration, timestamp relationships and how unavailable new data is indicated. The document does not define automatic data backfill, permanent retention or clock synchronisation; these functions are not added here.

## Continued monitoring is separate from continued heating

The source requires fail-closed valves and gas shutoff with alarms for low natural-gas pressure, fan faults or emergency power loss. Backup monitoring therefore does not mean continued firing, nor does it guarantee that the steel-pipe batch is unaffected. Process-interruption handling must follow the formal control and process documents. The proposal lacks complete logic supporting automatic restart or automatic compensation of soaking time.

It lists steel-pipe normalising and annealing, usual process temperatures of 500–950°C, and nine workpiece-monitoring thermocouples. Their records may inform process decisions, but actual locations and data availability during interruption must first be established. Furnace temperature or a powered monitoring system alone does not establish completion of the batch's heat treatment.

## Include the checks in handover documents

The supply list includes computer controls, the uninterruptible power supply and site electrical equipment. Supplied documents include electrical schematics and wiring drawings, alarm-message text and a commissioning manual. Use these to define backup loads, expected hold-up time and data-verification scope in the final revision, then inspect under agreed conditions. No actual power-failure test or operating log is provided, so proposed functions are not presented as verified capability.

## Sources and enquiries

This article is based on historical proposal documents from Jiangsu Suneng Industrial Furnace Co., Ltd. and describes proposed configurations and supply conditions. The cited documents do not constitute proof of equipment delivery or acceptance.

Historical Suneng proposal for a large gas-fired bogie-hearth steel-pipe annealing furnace, 2015-08-27; PDF pages 1–22. Backup monitoring power and recording: pages 12–15; supply scope: pages 19–20.

Contact us on WeChat for a preliminary assessment of your operating requirements.
