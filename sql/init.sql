drop database if exists keno;
create database keno;
use keno;

drop table if exists issue;
create table issue(
	id int(4) not null unique auto_increment,  /* id */
	code varchar(32) not null,     			   /* code */
	issueno bigint not null,       		       /* 彩票期号 */
	originIssueNo varchar(32) not null,		   /* 外部网站彩票期号 */
	awardtime bigint not null,  			   /* 开奖时间 */
	result varchar(64) not null,     		   /* 开奖结果 */
	flag tinyint not null,     				   /* 是否已抓取 */
	primary key (code, issueno)
);