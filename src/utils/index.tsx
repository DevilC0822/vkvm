import { Tooltip } from 'antd';
/**
 * @description: 获取文本的 tooltip 显示
 * @param {any} text 文本
 * @param {object} options 选项
 * @param {number} options.rows 显示的行数，默认为1
 * @param {number | string} options.maxWidth 最大宽度，默认为500
 * @param {string} options.placeholder 为空时的显示，默认为''
 * @returns {React.ReactNode} 返回 tooltip 显示的文本
 */
export const getToolTipText = (
  text: any,
  options?: {
    rows?: number;
    maxWidth?: number | string;
    placeholder?: string;
  },
): React.ReactNode => {
  const { rows = 1, maxWidth = 500, placeholder = '' } = options ?? {};
  const item = (
    <div style={{ display: 'inline-flex', width: '100%' }}>
      <p
        style={{
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-inline-box',
          WebkitLineClamp: rows,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {text ?? placeholder}
      </p>
    </div>
  );
  return (
    <Tooltip title={text} overlayStyle={{ maxWidth }}>
      {item}
    </Tooltip>
  );
};

/**
 * 
 * @param url url
 * @param params 参数
 * @returns 返回拼接后的url
 */
export const formatUrl = (url: string, params: { [propsName: string]: any }) => {
  if (!params) {
    return url;
  }
  if (Object.keys(params).length === 0) {
    return url;
  }
  return url + '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
};