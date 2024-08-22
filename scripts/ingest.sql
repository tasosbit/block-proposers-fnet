.timer on
.changes on

drop table proposers;

create table proposers (rnd uint64, proposer varchar, payout uint64);

insert into proposers select rnd, proposer, payout from read_csv("input.csv.gz", ignore_errors = true);
