---
ACC: 1
DMG: 9
CD: 5.5
AS: 2
AC: 26
HP: 110
CR: 0.25
STR: 0
STRmult: 2
attackpower: 22
defensepower: 638.8
TTK: 29.04
hitchance: 19.09
---

| [[ACC\|Accuracy]]                 | [[Weapon]] Damage         | [[AS\|Attack Speed]] |
| --------------------------------- | ------------------------- | -------------------- |
| `INPUT[number:ACC]`               | `INPUT[number:DMG]`       | `INPUT[number:AS]`   |
| [[Crit\|Critical Rate]] (decimal) | [[Critical Damage]]       |                      |
| `INPUT[number:CR]`                | `INPUT[number:CD]`        |                      |
| [[STR]]                           | STR Multiplier (1h or 2h) |                      |
| `INPUT[number:STR]`               | `INPUT[number:STRmult]`   |                      |
| Target's [[HP]]                   | Target's [[AC\|Avoid]]    |                      |
| `INPUT[number:HP]`                | `INPUT[number:AC]`        |                      |
**Hit Chance = `VIEW[round(((14/15)^({AC}-{ACC}-1))*100, 2)][math:hitchance]`%**
**Attack Power = `VIEW[round(1.07^{ACC}*({DMG}+{STR}*{STRmult})*{AS}+({CR}*{CD}*{AS}), 1)][math:attackpower]`**
**Target's Defense Power = `VIEW[round({HP}*1.07^{AC}, 1)][math:defensepower]`**
**Time to Kill = `VIEW[round({defensepower}/{attackpower}, 2)][math:TTK]` Rounds**

This Time to Kill formula is not accurate for Hit Chances above 100%.