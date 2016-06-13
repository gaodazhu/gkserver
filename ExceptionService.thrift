/**
 * Thrift files can namespace, package, or prefix their output in various
 * target languages.
 */
namespace cpp com.mlsc
namespace java com.mlsc
namespace csharp com.mlsc


service ExceptionService{

	string checkException(),
}
