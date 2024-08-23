-- find missing rnds
-- returns <first missing> as rnd, <num missing> as missing
-- e.g. if it returns [13, 1] then only round 13 is missing
-- e.g. if it returns [13, 3] then rounds 13, 14, 15 are missing
select r1+1 as rnd, missing from (select rnd r1, lead(rnd) over (order by rnd rows between current row and 1 following) as r2, r2 - r1 - 1 as missing from proposers p) x where missing > 0
